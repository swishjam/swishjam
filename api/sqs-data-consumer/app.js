// const { PerformanceDataPayloadFormatter }  = require('./performanceDataPayloadFormatter');
const { Connect } = require('./db');

module.exports.consumeMessages = async (event, _context) => {
  try {
    console.log(`------------------------------ Start Lambda Function------------------------------`);
    //console.log('Received Event:', JSON.stringify(event));
    await Connect();

    /*if (!event?.Records?.length) return 'No records';
    console.log(`Processing ${event.Records.length} records.`);
    for (const record of event.Records) {
      //const data = new PerformanceDataPayloadFormatter(record.body);
      console.log(record.body);
    }
    return 'Successfully processed Records'*/
  } catch (err) {
    console.log(err);
    return err;
  }
};