import { MemoryHandler } from './memoryHandler.mjs';
import { ClientJS } from 'clientjs';
const fingerprinter = new ClientJS();

export class Event {
  constructor(type, data) {
    this.type = type;
    this.ts = Date.now();
    this.sessionId = MemoryHandler.get('sessionId');
    this.pageViewId = MemoryHandler.get('pageViewId');
    this.url = window.location.href;
    this.fingerprint = fingerprinter.getFingerprint();
    this.data = data;
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      pageViewId: this.pageViewId,
      type: this.type,
      url: this.url,
      timestamp: this.ts,
      deviceData: {
        fingerprint: this.fingerprint,
        userAgent: fingerprinter.getUserAgent(),
        browser: fingerprinter.getBrowser(),
        browserVersion: fingerprinter.getBrowserVersion(),
        os: fingerprinter.getOS(),
        osVersion: fingerprinter.getOSVersion(),
        device: fingerprinter.getDevice(),
        deviceType: fingerprinter.getDeviceType(),
        timezone: fingerprinter.getTimeZone(),
        language: fingerprinter.getLanguage(),
        isMobile: fingerprinter.isMobile(),
        foo: 'bar'
      },
      data: this.data,
    }
  }
}