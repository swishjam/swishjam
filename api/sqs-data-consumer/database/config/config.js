const { dbHost, dbDatabase, dbUsername, dbPassword, dbDialect } = process.env; 
module.exports = {
  "username": dbUsername,
  "password": dbPassword,
  "database": dbDatabase,
  "host": dbHost,
  "dialect": dbDialect,
}