module.exports = class FirstInputPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO first_input_performance_entries ${this.db.format(this._attrs())}`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      unique_identifier: this.event.uniqueIdentifier,
      page_view_identifier: this.event.pageViewIdentifier,
      site_id: this.event.siteId,
      duration: data.duration,
      entry_type: data.entryType,
      name: data.name,
      start_time: data.startTime,
      interaction_id: data.interactionId,
      processing_start: data.processingStart,
      processing_end: data.processingEnd,
      target: data.target,
    }
  }
}