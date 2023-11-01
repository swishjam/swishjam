import { UUID } from './uuid.mjs';
import { DataPersister } from './dataPersister.mjs';
import { DeviceIdentifiers } from './deviceIdentifiers.mjs';
import { SDK_VERSION } from './constants.mjs'

export class Event {
  constructor(eventName, attributes) {
    this.eventName = eventName;
    this.uuid = UUID.generate(`e-${Date.now()}`);
    this.ts = Date.now();
    this.sessionId = DataPersister.get('sessionId');
    this.pageViewId = DataPersister.get('pageViewId');
    this.userDeviceIdentifierValue = DeviceIdentifiers.getUserDeviceIdentifierValue();
    this.organizationDeviceIdentifierValue = DeviceIdentifiers.getOrganizationDeviceIdentifierValue();
    this.url = window.location.href;
    this.attributes = attributes;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      event: this.eventName,
      timestamp: this.ts,
      device_identifier: this.userDeviceIdentifierValue,
      user_device_identifier: this.userDeviceIdentifierValue,
      organization_device_identifier: this.organizationDeviceIdentifierValue,
      session_identifier: this.sessionId,
      page_view_identifier: this.pageViewId,
      url: this.url,
      ...this.attributes,
      sdk_version: SDK_VERSION,
      source: 'web'
    }
  }
}

export default Event;