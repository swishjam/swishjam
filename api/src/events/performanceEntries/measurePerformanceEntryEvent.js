module.exports = class MeasurePerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO measure_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
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
      detail: data.detail,
    }
  }
}