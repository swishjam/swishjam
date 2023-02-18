const { PerformanceDataPayloadFormatter } = require("./performanceDataPayloadFormatter");

module.exports.consumeMessages = async (event, _context) => {
  try {
    console.log(`Received event:`);
    console.log(JSON.stringify(event));
    if (!event?.Records?.length) return 'No records';
    console.log(`Processing ${event.Records.length} records.`);
    for (const record of event.Records) {
      const data = new PerformanceDataPayloadFormatter(record.body);
      console.log(record.body);
    }
    return 'Successfully processed Records'
  } catch (err) {
    console.log(err);
    return err;
  }
};