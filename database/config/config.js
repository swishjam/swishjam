require('dotenv').config()
const { dbHost, dbDatabase, dbUsername, dbPassword, dbDialect } = process.env; 
console.log(`dbHost: ${dbHost}, dbDatabase: ${dbDatabase}, dbUsername: ${dbUsername}, dbPassword: ${dbPassword}, dbDialect: ${dbDialect}`);
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