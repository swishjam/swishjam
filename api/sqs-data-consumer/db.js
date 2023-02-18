const { Sequelize } = require('sequelize');

// your config file will be in your directory
const Connect = async () => {
  const { dbHost, dbDatabase, dbUsername, dbPassword, dbDialect  } = process.env;
  const sequelize = new Sequelize(dbDatabase, dbUsername, dbPassword, {
    host: dbHost,
    port: 5432,
    logging: msg => console.log(`DB LOG: ${msg}`),
    // maxConcurrentQueries: 100,
    dialect: dbDialect,
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