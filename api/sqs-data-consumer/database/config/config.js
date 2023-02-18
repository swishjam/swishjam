require('dotenv').config()
const { dbHost, dbDatabase, dbUsername, dbPassword, dbDialect } = process.env; 

module.exports = {
  "development": {
    "username": dbUsername,
    "password": dbPassword,
    "database": dbDatabase,
    "host": dbHost,
    "dialect":  dbDialect,
  },
  "production": {
    "username": dbUsername,
    "password": dbPassword,
    "database": dbDatabase,
    "host": dbHost,
    "dialect":  dbDialect,
  }
}