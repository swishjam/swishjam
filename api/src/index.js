const PageViewEvent = require("./events/pageViewEvent");
const PageLeftEvent = require("./events/pageLeftEvent");
const PageLoadMetricEvent = require("./events/pageLoadMetricEvent");
const PerformanceEntryEvent = require("./events/performanceEntryEvent");
const DB = require("./db");

module.exports.captureEvents = async (payload, _context) => {
  console.log(`Number of events to insert: ${payload.data.length}`);
  // const dbPromises = payload.data.slice(7, 8).map(data => {
  const db = DB.connect();
  const dbPromises = payload.data.map(data => {
    switch(data._event) {
      case 'PAGE_VIEW':
        return new PageViewEvent(data, db).createPageView()
        // not catching error because I don't think we want any events captured if the page view fails?
        // return new PageViewEvent(data).createPageView().catch(err => { 
        //   console.error(`Failed to create ${data._event}: ${err}`);
        //   return {
        //     error: err, 
        //     failedEvent: data 
        //   }
        // });
      case 'PAGE_LEFT':
        return new PageLeftEvent(data, db).updatePageView().catch(err => { 
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err, 
            failedEvent: data 
          }
        });
      case 'PAGE_LOAD_METRIC':
        return new PageLoadMetricEvent(data, db).createOrUpdatePerformanceMetric().catch(err => { 
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err, 
            failedEvent: data 
          }
        });
      case 'PERFORMANCE_ENTRY':
        return new PerformanceEntryEvent(data, db).createPerformanceEntry().catch(err => { 
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err, 
            failedEvent: data 
          }
        });
      default:
        console.warn(`Unrecognized event type sent from instrumentation: ${data._event}`);
        return;
    }
  });
  console.log(`Awaiting ${dbPromises.length} dbPromises`);
  const results = await Promise.all(dbPromises);
  await db.killConnection();

  const successfulEvents = results.filter(result => !result?.error);
  return { 
    statusCode: 200, 
    numProcessedEvents: payload.data.length, 
    numSuccessfulEvents: successfulEvents.length, 
    numFailedEvents: results.length - successfulEvents.length 
  };
}