module.exports = class FirstInputPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO first_input_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      uuid: this.event.uuid,
      page_view_uuid: this.event.pageViewUuid,
      project_key: this.event.projectKey,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
      interaction_id: data.interactionId,
      processing_start: data.processingStart,
      processing_end: data.processingEnd,
      target: data.target,
    }
  }
}