const { PerformanceDataPayloadFormatter }  = require('./performanceDataPayloadFormatter');
const { Sequelize } = require('sequelize');
const config = require(__dirname + '/database/config/config.js');

// your config file will be in your directory
/*sequelize = new Sequelize(config.database, config.username, config.password, {
   host: config.host,
   port: 5432,
   logging: console.log,
   maxConcurrentQueries: 100,
   dialect: config.dialect,
   dialectOptions: {
       ssl:'Amazon RDS'
   },
   pool: { maxConnections: 5, maxIdleTime: 30},
   language: 'en'
})


try {
  sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    sequelize.close()
  })
  .catch(err => {
    sequelize.close()
    console.error('Unable to connect to the database:', err);
  });;
} catch (error) {
  console.error('Unable to connect to the database:', error);
  sequelize.close()
}*/

module.exports.consumeMessages = async (event, _context) => {
  try {
    console.log(`------------------------------ Start Lambda Function------------------------------`);
    // console.log('Sequelize Config: ', JSON.stringify(config));
    //console.log('Received Event:', JSON.stringify(event));
    
    
    
    if (!event?.Records?.length) return 'No records';
    console.log(`Processing ${event.Records.length} records.`);
    for (const record of event.Records) {
      //const data = new PerformanceDataPayloadFormatter(record.body);
      console.log(record.body);
    }
    return 'Successfully processed Records'
  } catch (err) {
    console.log(err);
    return err;
  }
};