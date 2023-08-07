module.exports = class LayoutShiftPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO layout_shift_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      uuid: this.event.uuid,
      page_view_uuid: this.event.pageViewUuid,
      project_key: this.event.projectKey,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      entry_type: data.entryType,
      start_time: data.startTime,
      duration: data.duration,
      value: data.value,
      last_input_time: data.lastInputTime,
    }
  }
}