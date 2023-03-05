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
    const { uuid, longTaskPerformanceEntryUuid, projectKey, pageViewUuid, data } = this.event;
    return {
      uuid: uuid,
      longtask_uuid: longTaskPerformanceEntryUuid,
      longtask_unique_identifier: longTaskPerformanceEntryUuid,
      page_view_uuid: pageViewUuid,
      project_key: projectKey,
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