require('dotenv').config()

if(!process.env.DB_USERNAME) throw new Error('DB_USERNAME ENV variable is not defined.');
if(!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD ENV variable is not defined.');
if(!process.env.DB_NAME) throw new Error('DB_NAME ENV variable is not defined.');
if(!process.env.DB_HOST) throw new Error('DB_HOST ENV variable is not defined.');

const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect:  'postgres',
}

module.exports = {
  test: config,
  development: config,
  production: config
}