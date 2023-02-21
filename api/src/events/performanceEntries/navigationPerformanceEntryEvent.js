module.exports = class NavigationPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO navigation_performance_entries ${this.db.format(this._attrs())}`;
  }

  _attrs() {
    const { data } = this.event;
    return {
      page_view_identifier: this.event.pageViewIdentifier,
      duration: data.duration,
      entry_type: data.entryType,
      name: data.name,
      start_time: data.startTime,
      initiator_type: data.initiatorType,
      dom_complete: data.domComplete,
      dom_content_loaded_event_end: data.domContentLoadedEventEnd,
      dom_content_loaded_event_start: data.domContentLoadedEventStart,
      dom_interactive: data.domInteractive,
      load_event_end: data.loadEventEnd,
      load_event_start: data.loadEventStart,
      redirect_count: data.redirectCount,
      type: data.type,
      unload_event_end: data.unloadEventEnd,
      unload_event_start: data.unloadEventStart,
    }
  }
}