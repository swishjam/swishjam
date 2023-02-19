const { PerformanceDataPayloadFormatter } = require('./performanceDataPayloadFormatter');
const { Database, Models } = require('./db');

module.exports.consumeMessages = async (event, _context) => {
  try {
    console.log(`------------------------------ Start Lambda Function------------------------------`);
    if (!event?.Records?.length) return 'No records';

    const db = Database();
    await db.authenticate();

    for (const record of event.Records) {
      const data = new PerformanceDataPayloadFormatter(record);
      if (!data.isUpdate()) {
        const { pageLoads, performanceMetrics } = Models(db); 
        let l = await pageLoads.create(data.pageloadData());
        console.log('page load returns: ',JSON.stringify(l));
        console.log(JSON.stringify(data.performanceMetrics()));
        await performanceMetrics.create(data.performanceMetrics()) || (() => {throw new Error('wtf')})();
        console.log('perf load returns: ',JSON.stringify(m));
      }
      /*
      console.log('table name to mode map')
      const tableNameToModelMap = {
        element_performance_entries: Models(db).elementPerformanceEntries,
        event_performance_entries: Models(db).eventPerformanceEntries,
        first_input_performance_entries: Models(db).firstInputPerformanceEntries,
        largest_contentful_paint_performance_entries: Models(db).largestContentfulPaintPerformanceEntries,
        longtask_performance_entries: Models(db).longtaskPerformanceEntries,
        longtask_task_attribution_performance_entries: Models(db).longtaskAttributionPerformanceEntries,
        mark_performance_entries: Models(db).markPerformanceEntries,
        measure_performance_entries: Models(db).measurePerformanceEntries,
        navigation_performance_entries: Models(db).navigationPerformanceEntries,
      };
      console.log('trying to create entries mapping');
      const performanceEntriesMap = data.performanceEntries();
      console.log(performanceEntriesMap)
      for (const [tableName, entries] of performanceEntriesMap) {
        await tableNameToModelMap[tableName].bulkCreate(entries);
      }*/
    };
    
    await db.close();
    return 'Successfully processed Records'
  } catch (err) {
    console.log(err);
    // await db.close();
    return err;
  }
};