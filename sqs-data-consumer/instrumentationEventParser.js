const DeviceDetector = require("device-detector-js"); 
const PageViewEvent = require("./pageViewEvent");
const PerformanceEntryFormatter = require('./performanceEntryFormatter');

module.exports = class InstrumentationEventParser {
  constructor(event) {
    this.event = event;
  }

  tableName() {

  }

  attributes() {
    const eventClass = {
      PAGE_VIEW: PageViewEvent,
      PAGE_LEFT: LeftPageEvent,
      PAGE_LOAD_METRIC: PageLoadMetricEvent,
      PERFORMANCE_ENTRY: PerformanceEntryEvent
    }[this.event._event]
    if (eventClass) {
      return new eventClass(this.event).attributes();
    } else {
      console.warn(`Unrecognized event type sent from instrumentation: ${this.event._event}`);
    }
  }
  static parse(event) {
    const parseMethod = {
      PAGE_VIEW: InstrumentationEventParser._pageViewAttrs,
      PAGE_LEFT: InstrumentationEventParser._pageLeftAttrs,
      PAGE_LOAD_METRIC: InstrumentationEventParser._pageLoadMetricAttrs,
      PERFORMANCE_ENTRY: InstrumentationEventParser._performanceEntryAttrs
    }[event._event]
    if (parseMethod) {
      method(event)
    } else {
      console.warn(`Unrecognized event type sent from instrumentation: ${event._event}`);
    }
  }

  static _pageViewAttrs(event) {
    const device = new DeviceDetector().parse(this.payload.userAgent);
    const attrs = {
      site_id: event.siteId,
      identifier: event.pageViewIdentifier,
      page_view_ts: event.data.pageLoadTs,
      full_url: event.data.url,
      url_host: new URL(event.data.url).host,
      url_path: new URL(event.data.url).pathname,
      url_query: new URL(event.data.url).search,
      user_agent: event.data.userAgent,
      device_client_type: device?.client?.type,
      device_client_name: device?.client?.name,
      device_client_version: device?.client?.version,
      device_client_engine: device?.client?.engine,
      device_client_engine_version: device?.client?.engineVersion,
      device_os_name: device?.os?.name,
      device_os_version: device?.os?.version,
      device_os_platform: device?.os?.platform,
      device_type: device?.device?.type,
      device_brand: device?.device?.brand,
      device_model: device?.device?.model,
      device_bot: device.bot,
      screen_width: event.data.screenWidth,
      screen_height: event.data.screenHeight,
      connection_effective_type: event.data.connection?.effectiveType,
      connection_downlink: event.data.connection?.downlink,
      connection_rtt: event.data.connection?.rtt,
    }
    return { table: 'page_views', attrs }
  }

  static _pageLeftAttrs(event) {
    const attrs = {
      site_id: event.siteId,
      identifier: event.pageViewIdentifier,
      page_left_ts: event.data.leftPageAtTs,
    }
    return { table: 'page_lefts', attrs }
  }

  static _pageLoadMetricAttrs(event) {
    const columnNameForMetric = {
      TTFB: 'time_to_first_byte',
      FCP: 'first_contentful_paint',
      FID: 'first_input_delay',
      LCP: 'largest_contentful_paint',
      INTP: 'interaction_to_next_paint',
      CLS: 'cumulative_layout_shift',
    }[event.data.type]
    let attrs = {};
    attrs[columnNameForMetric] = event.data.value;
    return attrs;
  }

  static _performanceEntryAttrs(event) {
    return PerformanceEntryFormatter.format(event.data, event.pageViewIdentifier)
  }
}