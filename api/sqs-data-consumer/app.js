const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/database/config/config.js')[env];

console.log(config);

// your config file will be in your directory
sequelize = new Sequelize(config.database, config.username, config.password, {
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
}