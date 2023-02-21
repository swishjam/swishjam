const EVENT_TYPE_TO_COLUMN_MAP = {
  FCP: 'first_contentful_paint',
  LCP: 'largest_contentful_paint',
  FID: 'first_input_delay',
  CLS: 'cumulative_layout_shift',
  TTFB: 'time_to_first_byte',
  INTP: 'interaction_to_next_paint',
}

module.exports = class PageLoadMetricEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async createOrUpdatePerformanceMetric() {
    const { type, value } = this.event.data;
    const column = EVENT_TYPE_TO_COLUMN_MAP[type];
    // TODO: WHY DOESN'T THIS DUMB QUERY WORK? IT SHOULD RETURN THE EXISTING PERFORMANCE METRIC!
    const existingPerformanceMetric = await this.db.client`
      SELECT * 
      FROM 
        performance_metrics 
      WHERE 
        page_view_identifier = ${this.event.pageViewIdentifier}
    `[0];
    console.log(`Existing performance metric for ${this.event.pageViewIdentifier}: ${JSON.stringify(existingPerformanceMetric)}`);
    if (existingPerformanceMetric) {
      await this.db.client`UPDATE performance_metrics SET ${column} = ${value} WHERE page_view_identifier = ${this.event.pageViewIdentifier}`;
    } else {
      console.log(`Creating new performance metric with ${this.event.pageViewIdentifier}, ${column} = ${value}`)
      const attrs = { page_view_identifier: this.event.pageViewIdentifier, [column]: value };
      await this.db.client`INSERT INTO performance_metrics ${this.db.format(attrs)}`;
    } 
  }
}