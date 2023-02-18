const { Sequelize } = require('sequelize');
const config = require(__dirname + '/database/config/config.js');

// your config file will be in your directory
const Connect = async () => {
  console.log('Sequelize Config: ', JSON.stringify(config));
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: 5432,
    logging: msg => console.log(`DB LOG: ${msg}`),
    maxConcurrentQueries: 100,
    dialect: config.dialect,
    // dialectOptions: { ssl: 'Amazon RDS' },
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en'
  })

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    await sequelize.close();
  }
}

module.exports = { Connect }