import CookieHelper from './cookieHelper.mjs';
import { DeviceIdentifiers } from './deviceIdentifiers.mjs';
import { PersistentUserDataManager } from './persistentUserDataManager.mjs';
import { SessionPersistance } from './sessionPersistance.mjs';
import { Util } from './util.mjs';

import {
  SDK_VERSION,
  SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME,
  SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY,
} from './constants.mjs'

export class Event {
  constructor(eventName, attributes, options = {}) {
    this.attributes = attributes;
    this.eventName = eventName;
    this.pageViewId = SessionPersistance.get(SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY);
    this.persistentDeviceData = PersistentUserDataManager.getAll() || {};
    this.sessionId = CookieHelper.getCookie(SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME);
    this.ts = Date.now();
    this.userDeviceIdentifierValue = DeviceIdentifiers.getUserDeviceIdentifierValue();
    this.url = window.location.href;
    this.userVisitStatus = SessionPersistance.get('userVisitStatus');
    this.uuid = Util.generateUUID(`evt-${Date.now()}`);

    this.options = options;
    this.options.includeOrganizationData = typeof options.includeOrganizationData === 'boolean' ? options.includeOrganizationData : true;
  }

  toJSON() {
    let data = {
      uuid: this.uuid,
      event: this.eventName,
      timestamp: this.ts,
      attributes: {
        ...this.attributes,
        device_identifier: this.userDeviceIdentifierValue,
        page_view_identifier: this.pageViewId,
        sdk_version: SDK_VERSION,
        session_identifier: this.sessionId,
        url: this.url,
        user_attributes: {
          unique_identifier: this.persistentDeviceData.user_unique_identifier,
          email: this.persistentDeviceData.user_email,
          first_name: this.persistentDeviceData.user_first_name,
          last_name: this.persistentDeviceData.user_last_name,
          metadata: this.persistentDeviceData.user_metadata,
          initial_url: this.persistentDeviceData.initial_url,
          initial_referrer: this.persistentDeviceData.initial_referrer,
        },
        user_visit_status: this.userVisitStatus,
      },
    }

    if (this.options.includeOrganizationData) {
      data.attributes.organization_attributes = {
        organization_identifier: this.persistentDeviceData.organization_identifier,
        organization_name: this.persistentDeviceData.organization_name,
        metadata: this.persistentDeviceData.organization_metadata,
      }
    }

    return data;
  }
}

export default Event;