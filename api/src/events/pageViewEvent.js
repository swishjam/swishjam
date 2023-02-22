const DeviceDetector = require("device-detector-js");

module.exports = class PageViewEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async createPageView() {
    await this.db.client`INSERT INTO page_views ${this.db.client(this._attrs())}`;
    return true;
  }

  _attrs() {
    const { siteId, pageViewIdentifier, data } = this.event;
    const device = new DeviceDetector().parse(data.userAgent);
    return {
      identifier: pageViewIdentifier,
      site_id: siteId,
      page_view_ts: new Date(data.pageLoadTs),
      full_url: data.url,
      url_host: this._safeUrlParse(data.url).host,
      url_path: this._safeUrlParse(data.url).pathname,
      url_query: this._safeUrlParse(data.url).search,
      referrer_full_url: data.referrerUrl,
      referrer_url_host: this._safeUrlParse(data.referrerUrl).host,
      referrer_url_path: this._safeUrlParse(data.referrerUrl).pathname,
      referrer_url_query: this._safeUrlParse(data.referrerUrl).search,
      user_agent: data.userAgent,
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
      screen_width: data.screenWidth,
      screen_height: data.screenHeight,
      connection_effective_type: data.connection.effectiveType,
      connection_downlink: data.connection.downlink,
      connection_rtt: data.connection.rtt,
    }
  }

  _safeUrlParse(url) {
    try {
      return new URL(url);
    } catch (e) {
      return {};
    }
  }
}