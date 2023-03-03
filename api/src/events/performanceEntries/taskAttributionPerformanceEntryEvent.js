module.exports = class TaskAttributionPerformanceEntryEvent {
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
      uuid: this.event.uuid,
      unique_identifier: this.event.uuid,
      longtask_uuid: this.event.longTaskPerformanceEntryUuid,
      longtask_unique_identifier: this.event.longTaskPerformanceEntryUuid,
      page_view_identifier: this.event.pageViewUuid,
      page_view_uuid: this.event.pageViewUuid,
      site_id: this.event.siteId,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
      container_type: data.containerType,
      container_src: decodeURIComponent(data.containerSrc || "").substr(0, 255),
      container_id: data.containerId,
      container_name: data.containerName,
    }
  }
}