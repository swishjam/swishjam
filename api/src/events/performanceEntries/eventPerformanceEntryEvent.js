module.exports = class EventPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO event_performance_entries ${this.db.format(this._attrs())} ON CONFLICT (unique_identifier) DO NOTHING`;
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