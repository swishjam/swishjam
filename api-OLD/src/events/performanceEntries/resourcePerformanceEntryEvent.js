module.exports = class ResourcePerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async create() {
    await this.db.client`INSERT INTO resource_performance_entries ${this.db.format(this._attrs())} ON CONFLICT DO NOTHING`;
    return true;
  }

  _attrs() {
    const { uuid, pageViewUuid, projectKey, data } = this.event;
    return {
      uuid: uuid,
      page_view_uuid: pageViewUuid,
      project_key: projectKey,
      name: decodeURIComponent(data.name || "").substr(0, 255),
      name_to_url_host: (this._safeUrl(data.name).host || '').substr(0, 255),
      name_to_url_path: (this._safeUrl(data.name).pathname || '').substr(0, 255),
      name_to_url_query: (this._safeUrl(data.name).search || '').substr(0, 255),
      entry_type: data.entryType,
      start_time: data.startTime,
      duration: data.duration,
      initiator_type: data.initiatorType,
      render_blocking_status: data.renderBlockingStatus,
      worker_start: data.workerStart,
      redirect_start: data.redirectStart,
      redirect_end: data.redirectEnd,
      fetch_start: data.fetchStart,
      domain_lookup_start: data.domainLookupStart,
      domain_lookup_end: data.domainLookupEnd,
      connect_start: data.connectStart,
      connect_end: data.connectEnd,
      secure_connection_start: data.secureConnectionStart,
      request_start: data.requestStart,
      response_start: data.responseStart,
      response_end: data.responseEnd,
      transfer_size: data.transferSize,
      encoded_body_size: data.encodedBodySize,
      decoded_body_size: data.decodedBodySize,
      next_hop_protocol: data.nextHopProtocol,
      ...this._computedDurations(data)
    }
  }

  _computedDurations(requestTiming) {
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
  }

  _safeUrl(name) {
    try {
      return new URL(decodeURIComponent(name));
    } catch(err) {
      return {};
    }
  }
}