import DeviceDetector = require("device-detector-js"); 
 
 class PerformanceDataPayloadFormatter {
  constructor(payload) {
    this.payload = payload;
  }

  isUpdate() {
    return this.payload.pageLoadTs ? false : true;    
  }

  pageloadData() {
    const deviceDetector = new DeviceDetector();
    const device = deviceDetector.parse(this.payload.userAgent);
    

    return {
      identifier: this.payload.pageLoadId,
      site_id: this.payload.siteId,
      page_load_ts: this.payload.pageLoadTs,
      full_url: this.payload.url,
      url_host: new URL(this.payload.url).host,
      url_path: new URL(this.payload.url).pathname,
      url_query: new URL(this.payload.url).search,
      user_agent: this.payload.userAgent,
      device_client_type: '',
      device_client_name: '',
      device_client_version: '',
      screen_width: this.payload.screenWidth,
      screen_height: this.payload.screenHeight,
      connection_effective_type: this.payload.connection.effectiveType,
      connection_downlink: this.payload.connection.downlink,
      connection_rtt: this.payload.connection.rtt,
    }
  }

  performanceMetrics() {
    return {
      page_load_identifier: this.pageloadData().identifier, // should this be the identifier? or the primary key ID?
      time_to_first_byte: this.payload.performanceMetrics?.TTFB?.value,
      first_contentful_paint: this.payload.performanceMetrics?.FCP?.value,
      first_input_delay: this.payload.performanceMetrics?.FID?.value,
      largest_contentful_paint: this.payload.performanceMetrics?.LCP?.value,
      interaction_to_next_paint: this.payload.performanceMetrics?.INTP?.value,
      cumulative_layout_shift: this.payload.performanceMetrics?.CLS?.value,
      // dom_interactive: this.payload.performanceMetrics?.DI?.value,
    }
  }
}

module.exports = {
  PerformanceDataPayloadFormatter
}