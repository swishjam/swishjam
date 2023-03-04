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
    const { data } = this.event;
    return {
      unique_identifier: this.event.uuid || this.event.uniqueIdentifier,
      uuid: this.event.uuid || this.event.uniqueIdentifier,
      page_view_identifier: this.event.pageViewUuid || this.event.pageViewIdentifier,
      page_view_uuid: this.event.pageViewUuid || this.event.pageViewIdentifier,
      site_id: this.event.siteId,
      project_key: this.event.projectKey,
      name: decodeURIComponent(data.name || "").substr(0, 255),
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
      // response_status: data.responseStatus
    }
  }
}