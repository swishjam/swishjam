module.exports = class ResourcePerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    return await this.db.client`INSERT INTO longtask_task_attribution_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    const { data } = this.event;
    return {
      long_task_performance_entry_id: '',
      page_view_identifier: this.event.pageViewIdentifier,
      duration: data.duration,
      entry_type: data.entryType,
      name: data.name,
      start_time: data.startTime,
      container_type: data.containerType,
      container_src: data.containerSrc,
      container_id: data.containerId,
      container_name: data.containerName,
    }
  }
}