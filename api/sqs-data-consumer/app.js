const { PerformanceDataPayloadFormatter } = require('./performanceDataPayloadFormatter');
const { DB } = require('./db');

module.exports.consumeMessages = async (event, _context) => {
  console.log(`------------------------------ Start Lambda Function------------------------------`);
  let db;
  try {
    if (!event?.Records?.length) return 'No records';
    db = new DB();
    for (const record of event.Records) {
      const data = new PerformanceDataPayloadFormatter(record);
      if (!data.isUpdate()) {
        console.log(`Creating new page load: ${data.pageViewData().identifier}`)
        await db.createPageView(data.pageViewData());
      }

      const performanceMetricsData = data.performanceMetricsData();
      if (Object.keys(performanceMetricsData).length > 0) {
        const existingPerformanceMetricsForPageView = await db.getPerformanceMetricsByPageViewIdentifier(performanceMetricsData.page_view_identifier);
        if (existingPerformanceMetricsForPageView) {
          console.log(`Updating existing performance metrics for page view ${data.page_view_identifier}: ${JSON.stringify(performanceMetricsData)}`);
          await db.updatePerformanceMetrics(performanceMetricsData);
        } else {
          console.log(`Creating new performance metrics for page view ${data.page_view_identifier}: ${JSON.stringify(performanceMetricsData)}`);
          await db.createPerformanceMetrics(performanceMetricsData);
        }
      }

      // const entryTypeToModelMap = {
      //   'element': Models(db).elementPerformanceEntries,
      //   'event': Models(db).eventPerformanceEntries,
      //   'first-input': Models(db).firstInputPerformanceEntries,
      //   'largest-contentful-paint': Models(db).largestContentfulPaintPerformanceEntries,
      //   'longtask': Models(db).longtaskPerformanceEntries,
      //   'taskattribution': Models(db).longtaskAttributionPerformanceEntries,
      //   'mark': Models(db).markPerformanceEntries,
      //   'measure': Models(db).measurePerformanceEntries,
      //   'navigation': Models(db).navigationPerformanceEntries,
      // };
      // console.log('trying to create entries mapping');
      // const performanceEntriesMap = data.performanceEntries();
      // console.log(performanceEntriesMap);
      // for (const { entryType, data } of entryTypeToModelMap) {
      //   await entryTypeToModelMap[entryType].bulkCreate(data);
      // }
    };
    
    await db.killConnection();
    return 'Successfully processed Records'
  } catch (err) {
    console.log(err);
    // await db.close();
    if (db) await db.killConnection();
    return err;
  }
};