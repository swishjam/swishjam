const postgres = require('postgres');

module.exports = class DB {
  constructor() {
    this.client = postgres({
      host: process.env.dbHost,
      port: 5432,
      database: process.env.dbDatabase,
      username: process.env.dbUsername,
      password: process.env.dbPassword,
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
    console.log('Killing connection to DB');
    await this.client.end();
  }
}