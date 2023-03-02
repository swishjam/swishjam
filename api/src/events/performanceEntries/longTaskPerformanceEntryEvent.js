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
    const { data } = this.event;
    return {
      unique_identifier: this.event.uniqueIdentifier,
      page_view_identifier: this.event.pageViewIdentifier,
      site_id: this.event.siteId,
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
        uniqueIdentifier: `${this.event.uniqueIdentifier}-${i}`,
        longTaskPerformanceEntryIdentifier: this.event.uniqueIdentifier,
        pageViewIdentifier: this.event.pageViewIdentifier,
        siteId: this.event.siteId,
        data: taskAttributionData,
      };
      const createPromise = new TaskAttributionPerformanceEntryEvent(taskAttributionEvent, this.db).create();
      promises.push(createPromise);
    }
    await Promise.all(promises);
  }
}