import { UUID } from './uuid.mjs';
import { DataPersister } from './dataPersister.mjs';
import { DeviceDetails } from './deviceDetails';
import { SDK_VERSION } from './version.mjs'

export class Event {
  constructor(eventName, analyticsFamily, data) {
    this.eventName = eventName;
    this.analyticsFamily = analyticsFamily;
    this.uuid = UUID.generate(`e-${Date.now()}`);
    this.ts = Date.now();
    this.sessionId = DataPersister.get('sessionId');
    this.pageViewId = DataPersister.get('pageViewId');
    this.fingerprint = DeviceDetails.deviceFingerprint();
    this.url = window.location.href;
    this.data = data;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      event: this.eventName,
      timestamp: this.ts,
      analytics_family: this.analyticsFamily,
      device_identifier: this.fingerprint,
      session_identifier: this.sessionId,
      page_view_identifier: this.pageViewId,
      url: this.url,
      device_fingerprint: this.fingerprint,
      ...this.data,
      sdk_version: SDK_VERSION,
    }
  }
}