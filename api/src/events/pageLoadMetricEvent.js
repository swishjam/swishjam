const VALID_PERFORMANCE_METRICS = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INP'];

module.exports = class PageLoadMetricEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async createPerformanceMetric() {
    const { type, value } = this.event.data;
    if (VALID_PERFORMANCE_METRICS.includes(type)) {
      const attrs = { 
        unique_identifier: this.event.uniqueIdentifier,
        page_view_identifier: this.event.pageViewIdentifier, 
        site_id: this.event.siteId,
        metric_name: type, 
        metric_value: value 
      };
      const existingMetric = await this.db.client`
        SELECT *
        FROM
          performance_metrics
        WHERE
          page_view_identifier = ${this.event.pageViewIdentifier} AND 
          metric_name = ${type}
      `[0];
      // do all performance metrics only increase on 'updated' values...?
      // accounting for potential out of order events
      if (existingMetric && existingMetric.value < value) {
        console.log(`Performance metric already exists for ${this.event.pageViewIdentifier} and ${type}, updating it...`);
        await this.db.client`
          UPDATE 
            performance_metrics 
          SET ${this.db.format(attrs)} 
          WHERE
            page_view_identifier = ${this.event.pageViewIdentifier} AND
            metric_name = ${type}
        `;
      } else {
        await this.db.client`INSERT INTO performance_metrics ${this.db.format(attrs)} ON CONFLICT (unique_identifier) DO NOTHING`;
        console.log(`Created new performance metric for ${type}`);
      }
      return true;
    } else {
      console.warn(`Unknown performance metric type: ${type}`);
    }
  }
}