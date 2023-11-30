import { UUID } from './uuid.mjs';
import { SessionPersistance } from './sessionPersistance.mjs';
import { DeviceIdentifiers } from './deviceIdentifiers.mjs';
import { PersistentUserDataManager } from './persistentUserDataManager.mjs';
import { SDK_VERSION } from './constants.mjs'

export class Event {
  constructor(eventName, attributes) {
    this.eventName = eventName;
    this.attributes = attributes;
    this.uuid = UUID.generate(`e-${Date.now()}`);
    this.ts = Date.now();
    this.sessionId = SessionPersistance.get('sessionId');
    this.pageViewId = SessionPersistance.get('pageViewId');
    this.userDeviceIdentifierValue = DeviceIdentifiers.getUserDeviceIdentifierValue();
    this.organizationDeviceIdentifierValue = DeviceIdentifiers.getOrganizationDeviceIdentifierValue();
    this.userAttributes = PersistentUserDataManager.getAll();
    this.url = window.location.href;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      event: this.eventName,
      timestamp: this.ts,
      sdk_version: SDK_VERSION,
      source: 'web',
      attributes: {
        device_identifier: this.userDeviceIdentifierValue,
        user_device_identifier: this.userDeviceIdentifierValue,
        organization_device_identifier: this.organizationDeviceIdentifierValue,
        session_identifier: this.sessionId,
        page_view_identifier: this.pageViewId,
        url: this.url,
        ...this.attributes,
        user_attributes: this.userAttributes,
      },
    }
  }
}

export default Event;