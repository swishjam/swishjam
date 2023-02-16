module.exports.lambdaHandler = async (event, _context) => {
  try {
    if (!(event?.Records?.length)) {
      return 'No records'
    }
    console.log(`Processing ${event.Records.length} records!!!`);
    for (const record of event.Records) {
      console.log(record.body);
    }
    return 'Successfully processed Records'
  } catch (err) {
    console.log(err);
    return err;
  }

};