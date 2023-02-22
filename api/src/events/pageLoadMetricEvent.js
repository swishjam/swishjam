const VALID_PERFORMANCE_METRICS = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INTP'];

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
      await this.db.client`INSERT INTO performance_metrics ${this.db.format(attrs)}`;
      return true;
    } else {
      console.warn(`Unknown performance metric type: ${type}`);
    }
  }
}