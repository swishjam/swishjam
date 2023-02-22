const PageViewEvent = require("./events/pageViewEvent");
const PageLeftEvent = require("./events/pageLeftEvent");
const PageLoadMetricEvent = require("./events/pageLoadMetricEvent");
const PerformanceEntryEvent = require("./events/performanceEntryEvent");
const DB = require("./db");
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

module.exports.captureEvents = async ({ s3Bucket, s3Key }, _context) => {
  console.log(`Fetching events from S3: ${s3Bucket}/${s3Key}`);
  const { Body } = await S3.getObject({ Bucket: s3Bucket, Key: s3Key }).promise();
  const payload = JSON.parse(Body);
  console.log(`Number of events to insert: ${payload.data.length}`);
  
  const db = DB.connect();
  const dbPromises = payload.data.map(data => {
    switch(data._event) {
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
  const results = await Promise.all(dbPromises);
  await db.killConnection();

  const failedEvents = results.filter(result => result?.error);
  if (failedEvents.length > 0) {
    const Bucket = process.env.FAILED_TO_PROCESS_EVENT_DATA_S3_BUCKET_NAME;
    const Body = JSON.stringify({ siteId: payload.siteId, data: failedEvents });
    console.error(`Uploading ${failedEvents.length} failed to process events to ${Bucket}/${s3Key}`);
    await S3.putObject({ Bucket, Key: s3Key, Body }).promise();
  }

  console.log(`Deleting ${s3Bucket}/${s3Key} from S3....`);
  await S3.deleteObject({ Bucket: s3Bucket, Key: s3Key }).promise();
  console.log(`~~~~Done!~~~~`);
  console.log(`Num events processed: ${payload.data.length}`);
  console.log(`Num successful: ${results.length - failedEvents.length}`); 
  console.log(`Num failed: ${failedEvents.length}`);

  return { 
    statusCode: 200, 
    numProcessedEvents: payload.data.length, 
    numSuccessfulEvents: results.length - failedEvents.length,
    numFailedEvents: failedEvents.length 
  };
}