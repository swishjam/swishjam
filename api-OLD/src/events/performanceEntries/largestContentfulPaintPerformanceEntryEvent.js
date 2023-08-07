module.exports = class LargestContentfulPaintPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO largest_contentful_paint_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      uuid: this.event.uuid,
      page_view_uuid: this.event.pageViewUuid,
      project_key: this.event.projectKey,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
      element_identifier: data.element,
      render_time: data.renderTime,
      load_time: data.loadTime,
      size: data.size,
      element_id: data.id,
      url: decodeURIComponent(data.url || '').substr(0, 255),
    }
  }
}