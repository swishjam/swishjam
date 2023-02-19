const postgres = require('postgres');

class DB {
  constructor() {
    this.dbClient = postgres({
      host: process.env.dbHost,
      port: 5432,
      database: process.env.dbDatabase,
      username: process.env.dbUsername,
      password: process.env.dbPassword,
      transform: { undefined: null }
    })
  }

  async killConnection() {
    await this.dbClient.end();
  }

  async createPageView(data) {
    return await this.dbClient`INSERT INTO page_views ${this.dbClient(data)}`;
  }

  async getPageLoadByIdentifier(identifier) {
    return (await this.dbClient`SELECT * FROM page_views WHERE identifier = ${identifier} LIMIT 1`)[0];
  }

  async createPerformanceMetrics(data) {
    return await this.dbClient`INSERT INTO performance_metrics ${this.dbClient(data)}`;
  }

  async updatePerformanceMetrics(data) {
    return await this.dbClient`UPDATE performance_metrics SET ${this.dbClient(data)} WHERE page_view_identifier = ${data.page_view_identifier}`;
  }

  async getPerformanceMetricsByPageViewIdentifier(identifier) {
    console.log('Fetching performance metrics for page view: ', identifier)
    return (await this.dbClient`SELECT * FROM performance_metrics WHERE page_view_identifier = ${identifier} LIMIT 1`)[0];
  }
}

module.exports = { DB }