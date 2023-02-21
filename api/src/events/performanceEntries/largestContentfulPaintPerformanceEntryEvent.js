module.exports = class LargestContentfulPaintPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    return await this.db.client`INSERT INTO largest_contentful_paint_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    const { data } = this.event;
    return {
      page_view_identifier: this.event.pageViewIdentifier,
      duration: data.duration,
      entry_type: data.entryType,
      name: data.name,
      start_time: data.startTime,
      element_identifier: data.element,
      render_time: data.renderTime,
      load_time: data.loadTime,
      size: data.size,
      element_id: data.id,
      url: data.url,
    }
  }
}