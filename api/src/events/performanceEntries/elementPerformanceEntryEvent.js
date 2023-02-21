module.exports = class ElementPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    return await this.db.client`INSERT INTO element_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    return {
      page_view_identifier: this.event.data.pageViewIdentifier,
      duration: this.event.data.duration,
      entry_type: this.event.data.entryType,
      name: this.event.data.name,
      start_time: this.event.data.startTime,
      element_identifier: this.event.data.element,
      element_identifier_type: this.event.data.id,
      identifier: this.event.data.identifier,
      intersection_rect: this.event.data.intersectionRect,
      load_time: this.event.data.loadTime,
      natural_height: this.event.data.naturalHeight,
      render_time: this.event.data.renderTime,
      url: this.event.data.url,
    }
  }
}