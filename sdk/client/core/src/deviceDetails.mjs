import { ClientJS } from '@swishjam/clientjs';

export class DeviceDetails { 
  static all() {
    return {
      device_fingerprint: this.deviceFingerprint(),
      user_agent: this.userAgent(),
      browser_name: this.browser(),
      browser_version: this.browserVersion(),
      os: this.os(),
      os_version: this.osVersion(),
      device: this.device(),
      device_type: this.deviceType(),
      timezone: this.timeZone(),
      language: this.language(),
      is_mobile: this.isMobile(),
    }
  }

  static deviceFingerprint = () => this._clientJS().getFingerprint();
  static userAgent = () => this._clientJS().getUserAgent();
  static browser = () => this._clientJS().getBrowser();
  static browserVersion = () => this._clientJS().getBrowserVersion();
  static os = () => this._clientJS().getOS();
  static osVersion = () => this._clientJS().getOSVersion();
  static device = () => this._clientJS().getDevice();
  static deviceType = () => this._clientJS().getDeviceType();
  static timeZone = () => this._clientJS().getTimeZone();
  static language = () => this._clientJS().getLanguage();
  static isMobile = () => this._clientJS().isMobile();

  static _clientJS = () => {
    /*if (this._clientJSInstance) return this._clientJSInstance;
    this._clientJSInstance = {
      getFingerprint: () => { },
      getUserAgent: () => { },
      getBrowser: () => { },
      getBrowserVersion: () => { },
      getOS: () => { },
      getOSVersion: () => { },
      getDevice: () => { },
      getDeviceType: () => { },
      getTimeZone: () => { },
      getLanguage: () => { },
      isMobile: () => { },
    };
    return this._clientJSInstance;*/
     
    if(this._clientJSInstance) return this._clientJSInstance;
    this._clientJSInstance = new ClientJS();
    return this._clientJSInstance;
  }
}