module.exports = class ElementPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO element_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      unique_identifier: this.event.uuid || this.event.uniqueIdentifier,
      uuid: this.event.uuid || this.event.uniqueIdentifier,
      page_view_identifier: this.event.pageViewUuid || this.event.pageViewIdentifier,
      page_view_uuid: this.event.pageViewUuid || this.event.pageViewIdentifier,
      site_id: this.event.siteId,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
      element_identifier: data.element,
      element_identifier_type: data.id,
      identifier: data.identifier,
      intersection_rect: data.intersectionRect,
      load_time: data.loadTime,
      natural_height: data.naturalHeight,
      render_time: data.renderTime,
      url: decodeURIComponent(data.url || '').substr(0, 255),
    }
  }
}