const { Sequelize } = require('sequelize');
const pageLoadModel = require('./database/models/page_loads');

const Database = () => {
  const { dbHost, dbDatabase, dbUsername, dbPassword, dbDialect  } = process.env;
  const sq = new Sequelize(dbDatabase, dbUsername, dbPassword, {
    host: dbHost,
    port: 5432,
    logging: msg => console.log(`DB LOG: ${msg}`),
    dialect: dbDialect,
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en'
  })
  return sq;
}

const Models = (db) => {
  const pageLoads = pageLoadModel(db, Sequelize.DataTypes);
  return {
    pageLoads
  }
}

module.exports = {
  Database,
  Models
}