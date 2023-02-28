module.exports = class NavigationPerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO navigation_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
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
      name: (data.name || "").substr(0, 255),
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