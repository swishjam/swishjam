module.exports.consumeMessages = async (event, _context) => {
  console.log(`------------ consumed event ------------`);
  try {
    console.log(`Received event:`)
    console.dir(event, {depth: null, colors: true})
 
    const body = JSON.parse(event.body)

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