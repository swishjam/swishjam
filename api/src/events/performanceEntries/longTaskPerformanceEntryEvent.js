module.exports = class LongTaskPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    return await this.db.client`INSERT INTO longtask_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    const { data } = this.event;
    return {
      page_view_identifier: this.event.pageViewIdentifier,
      duration: data.duration,
      entry_type: data.entryType,
      name: data.name,
      start_time: data.startTime,
    }
  }
}