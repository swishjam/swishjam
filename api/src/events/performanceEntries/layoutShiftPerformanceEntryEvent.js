module.exports = class LayoutShiftPerformanceEntryEvent {
  constructor(event) {
    this.event = event;
  }

  async create() {
    return await this.db.client`INSERT INTO layout_shift_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    const { data } = this.event;
    return {
      page_view_identifier: this.event.pageViewIdentifier,
      name: data.name,
      entry_type: data.entryType,
      start_time: data.startTime,
      duration: data.duration,
      value: data.value,
      last_input_time: data.lastInputTime,
    }
  }
}