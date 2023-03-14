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
    const { uuid, pageViewUuid, projectKey, data } = this.event;
    return {
      uuid: uuid,
      page_view_uuid: pageViewUuid,
      project_key: projectKey,
      duration: data.duration,
      entry_type: data.entryType,
      name: decodeURIComponent(data.name || "").substr(0, 255),
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

      connect_end: data.connectEnd,
      connect_start: data.connectStart,
      decoded_body_size: data.decodedBodySize,
      domain_lookup_end: data.domainLookupEnd,
      domain_lookup_start: data.domainLookupStart,
      encoded_body_size: data.encodedBodySize,
      fetch_start: data.fetchStart,
      redirect_end: data.redirectEnd,
      redirect_start: data.redirectStart,
      render_blocking_status: data.renderBlockingStatus,
      request_start: data.requestStart,
      response_end: data.responseEnd,
      response_start: data.responseStart,
      response_status: data.responseStatus,
      secure_connection_start: data.secureConnectionStart,
      transfer_size: data.transferSize,
    }
  }
}