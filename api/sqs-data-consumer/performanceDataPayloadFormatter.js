const DeviceDetector = require("device-detector-js"); 
const PerformanceEntryFormatter = require('./performanceEntryFormatter');

class PerformanceDataPayloadFormatter {
  constructor(payload) {
    this.payload = payload;
  }

  pageViewIdentifier() {
    return this.payload.pageLoadId;
  }

  isUpdate() {
    return this.payload.pageLoadTs ? false : true;    
  }

  pageViewData() {
    const device = new DeviceDetector().parse(this.payload.userAgent);
    return {
      identifier: this.payload.pageLoadId,
      site_id: this.payload.siteId,
      page_view_ts: this.payload.pageLoadTs,
      full_url: this.payload.url,
      url_host: new URL(this.payload.url).host,
      url_path: new URL(this.payload.url).pathname,
      url_query: new URL(this.payload.url).search,
      user_agent: this.payload.userAgent,
      device_client_type: device.client.type,
      device_client_name: device.client.name,
      device_client_version: device.client.version,
      device_client_engine: device.client.engine,
      device_client_engine_version: device.client.engineVersion,
      device_os_name: device.os.name,
      device_os_version: device.os.version,
      device_os_platform: device.os.platform,
      device_type: device.device.type,
      device_brand: device.device.brand,
      device_model: device.device.model,
      device_bot: device.bot,
      screen_width: this.payload.screenWidth,
      screen_height: this.payload.screenHeight,
      connection_effective_type: this.payload.connection.effectiveType,
      connection_downlink: this.payload.connection.downlink,
      connection_rtt: this.payload.connection.rtt,
    }
  }

  performanceMetricsData() {
    return {
      page_view_identifier: this.pageViewIdentifier(), // should this be the identifier? or the primary key ID?
      time_to_first_byte: this.payload.performanceMetrics?.TTFB?.value,
      first_contentful_paint: this.payload.performanceMetrics?.FCP?.value,
      first_input_delay: this.payload.performanceMetrics?.FID?.value,
      largest_contentful_paint: this.payload.performanceMetrics?.LCP?.value,
      interaction_to_next_paint: this.payload.performanceMetrics?.INTP?.value,
      cumulative_layout_shift: this.payload.performanceMetrics?.CLS?.value,
      // dom_interactive: this.payload.performanceMetrics?.DI?.value,
    }
  }

  performanceEntries() {
    return (this.payload.performanceEntries || []).map(entry => PerformanceEntryFormatter.format(entry, this.pageViewData().identifier));
  }
}

module.exports = { PerformanceDataPayloadFormatter }