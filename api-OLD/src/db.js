const postgres = require('postgres');
require('dotenv').config();

module.exports = class DB {
  constructor() {
    this.client = postgres({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      transform: { undefined: null }
    })
  }

  static connect() {
    return new DB();
  }

  async execute(sql) {
    return await this.client`${this.client(sql)}`;
  }

  format(sql) {
    return this.client(sql);
  }

  async killConnection() {
    await this.client.end();
  }
}