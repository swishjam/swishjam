const { PerformanceDataPayloadFormatter } = require('./performanceDataPayloadFormatter');
const { Database, Models } = require('./db');

module.exports.consumeMessages = async (event, _context) => {
  try {
    console.log(`------------------------------ Start Lambda Function------------------------------`);
    // console.log('Received Event:', JSON.stringify(event));
   
    if (!event?.Records?.length) return 'No records';
    
    // Connect to the database
    const db = Database();
    console.log(db); 
    const { pageLoads } = Models(db); 
    await db.authenticate();
    //const pgl = await pageLoads.findAll(); 
    //console.log(pgl); 
    //console.log('Db Connection has been established successfully.');
    //let d = await pageLoads.findAll()
    //console.log(d)
    //db.close()

    for (const record of event.Records) {
      //console.log('Record:', JSON.stringify(record));
      const data = new PerformanceDataPayloadFormatter(record);
      const jane = pageLoads.build(data.pageloadData());       
      await jane.save();
      console.log('Jane was saved to the database!'); 
      //console.log(JSON.stringify(data.pageloadData()));
    }
    
    await db.close();
    return 'Successfully processed Records'
  } catch (err) {
    console.log(err);
    await db.close();
    return err;
  }
};