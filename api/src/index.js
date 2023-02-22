const PageViewEvent = require("./events/pageViewEvent");
const PageLeftEvent = require("./events/pageLeftEvent");
const PageLoadMetricEvent = require("./events/pageLoadMetricEvent");
const PerformanceEntryEvent = require("./events/performanceEntryEvent");
const DB = require("./db");

module.exports.processMessages = async ({ Records }, _context) => {
  console.log(`Number of records received: ${Records.length}`);
  const db = DB.connect();
  for (const record of Records) {
    console.log(`Processing record: ${JSON.stringify(record)}`);
    const payload = JSON.parse(record.body);
    await captureEvents(payload, db);
  }
  await db.killConnection();
  return { statusCode: 200 };
}

const captureEvents = async (payload, db) => {
  console.log(`Processing ${payload.data.length} events for ${payload.siteId}...`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  const dbPromises = payload.data.map(data => {
    switch (data._event) {
      case 'PAGE_VIEW':
        return new PageViewEvent(data, db).createPageView().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: data
          }
        });
      case 'PAGE_LEFT':
        return new PageLeftEvent(data, db).updatePageView().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: data
          }
        });
      case 'PAGE_LOAD_METRIC':
        return new PageLoadMetricEvent(data, db).createPerformanceMetric().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: data
          }
        });
      case 'PERFORMANCE_ENTRY':
        return new PerformanceEntryEvent(data, db).createPerformanceEntry().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: data
          }
        });
      default:
        console.warn(`Unrecognized event type sent from instrumentation: ${data._event}`);
        return;
    }
  });
  console.log(`Awaiting ${dbPromises.length} dbPromises`);
  return await Promise.all(dbPromises);
}