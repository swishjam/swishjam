const TaskAttributionPerformanceEntryEvent = require("./taskAttributionPerformanceEntryEvent");

module.exports = class LongTaskPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO longtask_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    await this._createTaskAttributions();
    return true;
  }

  _attrs() {
    const { uuid, pageViewUuid, projectKey, data } = this.event;
    return {
      uuid: uuid,
      page_view_uuid: pageViewUuid,
      project_key: projectKey,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      start_time: data.startTime,
    }
  }

  async _createTaskAttributions() {
    let promises = [];
    for(let i = 0; i < this.event.data.attribution.length; i++) {
      const taskAttributionData = this.event.data.attribution[i];
      const taskAttributionEvent = {
        uuid: `${this.event.uuid}-${i}`,
        longTaskPerformanceEntryUuid: this.event.uuid,
        pageViewUuid: this.event.pageViewUuid,
        projectKey: this.event.projectKey,
        data: taskAttributionData,
      };
      const createPromise = new TaskAttributionPerformanceEntryEvent(taskAttributionEvent, this.db).create();
      promises.push(createPromise);
    }
    await Promise.all(promises);
  }
}