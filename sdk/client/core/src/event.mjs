import { UUID } from './uuid.mjs';
import { SessionPersistance } from './sessionPersistance.mjs';
import { DeviceIdentifiers } from './deviceIdentifiers.mjs';
import { PersistentUserDataManager } from './persistentUserDataManager.mjs';
import { SDK_VERSION } from './constants.mjs'

export class Event {
  constructor(eventName, attributes) {
    this.attributes = attributes;
    this.eventName = eventName;
    this.pageViewId = SessionPersistance.get('pageViewId');
    this.sessionId = SessionPersistance.get('sessionId');
    this.ts = Date.now();
    this.userDeviceIdentifierValue = DeviceIdentifiers.getUserDeviceIdentifierValue();
    this.url = window.location.href;
    // exclude any attributes we don't want captured with each event
    // previous_session_started_at is only used to determine userVisitStatus and shouldn't be sent with each event
    this.userAttributes = PersistentUserDataManager.getAll({ except: ['previous_session_started_at'] });
    this.userVisitStatus = SessionPersistance.get('userVisitStatus');
    this.uuid = UUID.generate(`evt-${Date.now()}`);
  }

  toJSON() {
    return {
      uuid: this.uuid,
      event: this.eventName,
      timestamp: this.ts,
      attributes: {
        ...this.attributes,
        sdk_version: SDK_VERSION,
        device_identifier: this.userDeviceIdentifierValue,
        page_view_identifier: this.pageViewId,
        session_identifier: this.sessionId,
        url: this.url,
        user_attributes: this.userAttributes,
        user_visit_status: this.userVisitStatus,
      },
    }
  }
}

export default Event;