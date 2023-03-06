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
    const { uuid, pageViewUuid, projectKey, data } = this.event;
    return {
      uuid: uuid,
      page_view_uuid: pageViewUuid,
      project_key: projectKey,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
      detail: data.detail,
    }
  }
}