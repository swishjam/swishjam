module.exports = class PaintPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    return await this.db.client`INSERT INTO paint_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    const { data } = this.event;
    return {
      page_view_identifier: this.event.pageViewIdentifier,
      name: data.name,
      entry_type: data.entryType,
      start_time: data.startTime,
      duration: data.duration,
    }
  }
}