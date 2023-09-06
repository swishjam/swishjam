import { UUID } from './uuid.mjs';
import { MemoryHandler } from './memoryHandler.mjs';
import { ClientJS } from '@swishjam/clientjs';
const fingerprinter = new ClientJS();

export class Event {
  constructor(type, data) {
    this.uuid = UUID.generate(`e-${Date.now()}`);
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
      uuid: this.uuid,
      deviceId: this.fingerprint,
      sessionId: this.sessionId,
      pageViewId: this.pageViewId,
      type: this.type,
      name: this.type,
      url: this.url,
      timestamp: this.ts,
      data: this.data,
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
      },
    }
  }
}