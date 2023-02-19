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

  async createRespectivePerformanceEntry(formattedPerformanceEntryData) {
    const entryTypeToTableDict = {
      'element': 'element_performance_entries',
      'event': 'event_performance_entries',
      'first-input': 'first_input_performance_entries',
      'largest-contentful-paint': 'largest_contentful_paint_performance_entries',
      'layout-shift': 'layout_shift_performance_entries',
      'paint': 'paint_performance_entries',
      'resource': 'resource_performance_entries',
      'longtask': 'longtask_performance_entries',
      'taskattribution': 'longtask_attribution_performance_entries',
      'mark': 'mark_performance_entries',
      'measure': 'measure_performance_entries',
      'navigation': 'navigation_performance_entries',
    };
    const tableName = entryTypeToTableDict[formattedPerformanceEntryData?.entry_type];
    if (tableName) {
      console.log(`Inserting into ${tableName}: ${JSON.stringify(formattedPerformanceEntryData)}`);
      // return await this.dbClient`INSERT INTO page_views ${this.dbClient(data)}`;
      return await this.dbClient`INSERT INTO ${this.dbClient(tableName)} ${this.dbClient(formattedPerformanceEntryData)}`;
    } else {
      console.error(`UNRECOGNIZED PERFORMANCE ENTRY TYPE: ${formattedPerformanceEntryData?.entry_type || 'no entry type defined'}, BYPASSING.....`);
    }
  }
}

module.exports = { DB }