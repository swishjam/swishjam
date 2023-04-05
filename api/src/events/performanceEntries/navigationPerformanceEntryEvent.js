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
      ...this._computedDurations(data)
    }
  }

  _computedDurations(requestTiming) {
    try {
      const hasDetailedTiming = parseFloat(requestTiming.responseStart) > 0;
      if (hasDetailedTiming) {
        const redirect_duration = parseFloat(requestTiming.redirectEnd) - parseFloat(requestTiming.redirectStart);
        const dns_lookup_duration = parseFloat(requestTiming.domainLookupEnd) - parseFloat(requestTiming.domainLookupStart);
        const tcp_duration = (parseFloat(requestTiming.secureConnectionStart || 0) || parseFloat(requestTiming.connectStart)) - parseFloat(requestTiming.connectStart);
        const ssl_duration = parseFloat(requestTiming.connectEnd) - parseFloat(requestTiming.secureConnectionStart);
        const request_duration = parseFloat(requestTiming.responseStart) - parseFloat(requestTiming.requestStart);
        const response_duration = parseFloat(requestTiming.responseEnd) - parseFloat(requestTiming.responseStart);
  
        const firstTime = dns_lookup_duration > 0
          ? parseFloat(requestTiming.domainLookupStart || 0)
          : tcp_duration > 0
            ? parseFloat(requestTiming.connectStart || 0) || parseFloat(requestTiming.secureConnectionStart || 0)
            : ssl_duration > 0
              ? parseFloat(requestTiming.connectEnd || 0)
              : parseFloat(requestTiming.requestStart || 0) || parseFloat(requestTiming.fetchStart || 0);
        const waiting_duration = firstTime - parseFloat(requestTiming.fetchStart);
        return { waiting_duration, redirect_duration, dns_lookup_duration, tcp_duration, ssl_duration, request_duration, response_duration };
      } else {
        return {}
      }
    } catch(err) {
      return {}
    }
  }
}