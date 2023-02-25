module.exports = class LayoutShiftPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    // await this.db.client`INSERT INTO layout_shift_performance_entries ${this.db.format(this._attrs())} ON CONFLICT (unique_identifier) DO NOTHING`;
    await this.db.client`INSERT INTO layout_shift_performance_entries ${this.db.format(this._attrs())}`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      unique_identifier: this.event.uniqueIdentifier,
      page_view_identifier: this.event.pageViewIdentifier,
      site_id: this.event.siteId,
      name: data.name,
      entry_type: data.entryType,
      start_time: data.startTime,
      duration: data.duration,
      value: data.value,
      last_input_time: data.lastInputTime,
    }
  }
}