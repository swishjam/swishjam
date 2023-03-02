module.exports = class ResourcePerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO longtask_task_attribution_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    return true;
  }

  _attrs() {
    const { data } = this.event;
    return {
      long_task_performance_entry_id: '',
      unique_identifier: this.event.uniqueIdentifier,
      page_view_identifier: this.event.pageViewIdentifier,
      site_id: this.event.siteId,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
      container_type: data.containerType,
      container_src: data.containerSrc,
      container_id: data.containerId,
      container_name: data.containerName,
    }
  }
}