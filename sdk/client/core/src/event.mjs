import { UUID } from './uuid.mjs';
import { DataPersister } from './dataPersister.mjs';
import { DeviceIdentifier } from './deviceIdentifier.mjs';
import { SDK_VERSION } from './constants.mjs'

export class Event {
  constructor(eventName, data) {
    this.eventName = eventName;
    this.uuid = UUID.generate(`e-${Date.now()}`);
    this.ts = Date.now();
    this.sessionId = DataPersister.get('sessionId');
    this.pageViewId = DataPersister.get('pageViewId');
    this.deviceIdentifierValue = DeviceIdentifier.getDeviceIdentifierValue();
    this.url = window.location.href;
    this.data = data;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      event: this.eventName,
      timestamp: this.ts,
      device_identifier: this.deviceIdentifierValue,
      session_identifier: this.sessionId,
      page_view_identifier: this.pageViewId,
      url: this.url,
      ...this.data,
      sdk_version: SDK_VERSION,
    }
  }
}