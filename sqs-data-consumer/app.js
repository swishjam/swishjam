const { PerformanceDataPayloadFormatter } = require('./performanceDataPayloadFormatter');
const { DB } = require('./db');

module.exports.consumeMessages = async (event, _context) => {
  console.log(`------------------------------ Start Lambda Function------------------------------`);
  let db;
  try {
    if (!event?.Records?.length) return 'No records';
    db = new DB();
    for (const record of event.Records) {
      try {
        consumeMessage(record, db);
      } catch(err) {
        console.error('CANNOT CONSUME MESSAGE: ', err);
        console.error("PROVIDED RECORD:");
        console.error(JSON.stringify(record));
      }
    };
    
    await db.killConnection();
    return 'Successfully processed Records'
  } catch (err) {
    console.error(err);
    console.error('CANNOT CONSUME ANY RECORDS FROM EVENT:');
    console.log(JSON.stringify(event));
    if (db) await db.killConnection();
    return err;
  }
};

const consumeMessage = async (record, db) => {
  console.log(`Consuming message: ${record.body}`);

  const parsedEvent = new new InstrumentationEventParser(JSON.parse(record.body));

  const data = new PerformanceDataPayloadFormatter(JSON.parse(record.body));
  console.log(`Processing ${data.pageViewIdentifier()} page view`);
  if (!data.isUpdate()) {
    console.log(`Creating new page load: ${data.pageViewIdentifier()}`)
    await db.createPageView(data.pageViewData());
  }

  const performanceMetricsData = data.performanceMetricsData();
  if (Object.keys(performanceMetricsData).length > 0) {
    const existingPerformanceMetricsForPageView = await db.getPerformanceMetricsByPageViewIdentifier(data.pageViewIdentifier());
    if (existingPerformanceMetricsForPageView) {
      const mergedPerformanceMetricsData = {
        time_to_first_byte: performanceMetricsData.time_to_first_byte || existingPerformanceMetricsForPageView.time_to_first_byte,
        first_contentful_paint: performanceMetricsData.first_contentful_paint || existingPerformanceMetricsForPageView.first_contentful_paint,
        first_input_delay: performanceMetricsData.first_input_delay || existingPerformanceMetricsForPageView.first_input_delay,
        largest_contentful_paint: performanceMetricsData.largest_contentful_paint || existingPerformanceMetricsForPageView.largest_contentful_paint,
        interaction_to_next_paint: performanceMetricsData.interaction_to_next_paint || existingPerformanceMetricsForPageView.interaction_to_next_paint,
        cumulative_layout_shift: performanceMetricsData.cumulative_layout_shift || existingPerformanceMetricsForPageView.cumulative_layout_shift,
      };
      console.log(`Updating existing performance metrics for page view ${data.pageViewIdentifier()}: ${JSON.stringify(mergedPerformanceMetricsData)}`);
      await db.updatePerformanceMetrics(mergedPerformanceMetricsData);
    } else {
      console.log(`Creating new performance metrics for page view ${data.pageViewIdentifier()}: ${JSON.stringify(performanceMetricsData)}`);
      await db.createPerformanceMetrics(performanceMetricsData);
    }
  }

  const perfEntriesPromises = data.performanceEntries().map(formattedPerformanceEntry => db.createRespectivePerformanceEntry(formattedPerformanceEntry));
  await Promise.all(perfEntriesPromises);
}