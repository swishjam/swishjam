import { UUID } from './uuid.mjs';
import { DataPersister } from './dataPersister.mjs';
import { ClientJS } from '@swishjam/clientjs';
import { SDK_VERSION } from './version.mjs'

const fingerprinter = new ClientJS();

export class Event {
  constructor(eventName, eventType, data) {
    this.eventName = eventName;
    this.eventType = eventType;
    this.uuid = UUID.generate(`e-${Date.now()}`);
    this.ts = Date.now();
    this.sessionId = DataPersister.get('sessionId');
    this.pageViewId = DataPersister.get('pageViewId');
    this.url = window.location.href;
    this.fingerprint = fingerprinter.getFingerprint();
    this.data = data;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      event: this.eventName,
      event_type: this.eventType,
      device_identifier: this.fingerprint,
      session_identifier: this.sessionId,
      page_view_identifier: this.pageViewId,
      type: this.type,
      name: this.type,
      url: this.url,
      timestamp: this.ts,
      data: this.data,
      device_fingerprint: this.fingerprint,
      user_agent: fingerprinter.getUserAgent(),
      browser: fingerprinter.getBrowser(),
      browser_version: fingerprinter.getBrowserVersion(),
      os: fingerprinter.getOS(),
      os_version: fingerprinter.getOSVersion(),
      device: fingerprinter.getDevice(),
      device_type: fingerprinter.getDeviceType(),
      timezone: fingerprinter.getTimeZone(),
      language: fingerprinter.getLanguage(),
      is_mobile: fingerprinter.isMobile(),
      sdk_version: SDK_VERSION,
      properties: this.data,
    }
  }
}