const VALID_PERFORMANCE_METRICS = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INP'];

module.exports = class PageLoadMetricEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async createPerformanceMetric() {
    const { type, value } = this.event.data;
    if (VALID_PERFORMANCE_METRICS.includes(type)) {
      const existingMetric = (await this.db.client`
        SELECT 
          metric_value 
        FROM 
          performance_metrics 
        WHERE 
          page_view_uuid = ${this.event.pageViewUuid} AND 
          metric_name = ${type}
      `)[0];
      // do all performance metrics only increase on 'updated' values...?
      // accounting for potential out of order events
      if (existingMetric && parseFloat(existingMetric.metric_value) < parseFloat(value)) {
        await this.db.client`
          UPDATE 
            performance_metrics 
          SET ${this.db.format({ metric_value: value })} 
          WHERE
            page_view_uuid = ${this.event.pageViewUuid} AND
            metric_name = ${type}
        `;
      } else if(!existingMetric) {
        const attrs = {
          uuid: this.event.uuid,
          page_view_uuid: this.event.pageViewUuid,
          project_key: this.event.projectKey,
          metric_name: type,
          metric_value: value
        };
        await this.db.client`INSERT INTO performance_metrics ${this.db.format(attrs)}`;
        console.log(`Created new performance metric for ${type}`);
      } else {
        console.log(`Performance metric already exists for ${type} and ${this.event.pageViewUuid} with a larger metric_value, keeping the existing one.`)
      }
      return true; {}
    } else {
      console.warn(`Unknown performance metric type: ${type}`);
    }
  }
}