const PageViewEvent = require("./events/pageViewEvent");
const PageLeftEvent = require("./events/pageLeftEvent");
const PageLoadMetricEvent = require("./events/pageLoadMetricEvent");
const PerformanceEntryEvent = require("./events/performanceEntryEvent");
const DB = require("./db");
const { S3 } = require("aws-sdk");

module.exports.processMessages = async ({ Records }, _context) => {
  console.log(`Number of records received: ${Records.length}`);
  const db = DB.connect();
  try {
    for (const record of Records) {
      const payload = JSON.parse(record.body);
      await captureEvents(payload, db);
    }
    await db.killConnection();
    return { statusCode: 200 };
  } catch(err) {
    console.error(`Failed to process messages: ${err}`);
    console.error(`Bad payload received: ${JSON.stringify(Records)}`);
    await db.killConnection();
    throw err;
  }
}

const captureEvents = async (payload, db) => {
  console.log(`Processing ${payload.data.length} events for ${payload.projectKey || payload.siteId}...`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  const dbPromises = payload.data.map(data => {
    switch (data._event) {
      case 'PAGE_VIEW':
        return new PageViewEvent(data, db).createPageView().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: { body: data }
          }
        });
      case 'PAGE_LEFT':
        return new PageLeftEvent(data, db).updatePageView().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: { body: data }
          }
        });
      case 'PAGE_LOAD_METRIC':
        return new PageLoadMetricEvent(data, db).createPerformanceMetric().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: { body: data }
          }
        });
      case 'PERFORMANCE_ENTRY':
        return new PerformanceEntryEvent(data, db).createPerformanceEntry().catch(err => {
          console.error(`Failed to create ${data._event}: ${err}`);
          return {
            error: err.message,
            errorStack: err.stack,
            failedEvent: { body: data }
          }
        });
      default:
        console.warn(`Unrecognized event type sent from instrumentation: ${data._event}`);
        return;
    }
  });
  console.log(`Awaiting ${dbPromises.length} dbPromises`);
  const results = await Promise.all(dbPromises);
  console.log('All promises complete.');
  
  const failedEvents = results.filter(result => result && result.error);
  if (failedEvents.length > 0) {
    console.log(`Failed to capture ${failedEvents.length} events`);
    if (process.env.FAILED_EVENTS_S3_BUCKET_NAME) {
      console.log(`Uploading them to ${process.env.FAILED_EVENTS_S3_BUCKET_NAME } S3 Bucket...`);
      const s3 = new S3();
      const params = {
        Bucket: process.env.FAILED_EVENTS_S3_BUCKET_NAME,
        Key: `${payload.siteId}/${Date.now()}-${failedEvents.length}.json`,
        Body: JSON.stringify({ Records: failedEvents })
      };
      await s3.upload(params).promise();
    }
  }
  return results;
}