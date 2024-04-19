import CookieHelper from './cookieHelper.mjs';
import { DeviceDetails } from './deviceDetails.mjs';
import { DeviceIdentifiers } from './deviceIdentifiers.mjs';
import { PersistentMemoryManager } from './PersistentMemoryManager.mjs';
import { SessionPersistance } from './sessionPersistance.mjs';
import { Util } from './util.mjs';
import {
  SDK_VERSION,
  SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME,
  SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY,
  SWISHJAM_SESSION_ATTRIBUTES_SESSION_STORAGE_KEY,
} from './constants.mjs'

const deviceDetails = new DeviceDetails();

export class Event {
  constructor(eventName, attributes = {}, options = {}) {
    this.eventName = eventName;
    this.attributes = attributes;
    this.options = options;
  }

  toJSON() {
    return {
      uuid: this.attributes.uuid ?? Util.generateUUID(`evt-${Date.now()}`),
      event: this.eventName,
      timestamp: Date.now(),
      attributes: {
        // referrer can sometimes be overridden by attributes just in case it's a SPA and the referrer is not indicative of the actual referrer
        page_referrer: Util.documentReferrerOrDirect(),
        ...deviceDetails.all(),
        ...SessionPersistance.get(SWISHJAM_SESSION_ATTRIBUTES_SESSION_STORAGE_KEY) || {},
        ...this.attributes,
        // `page_referrer` is replacing `referrer` now, but keeping `referrer` for backwards compatibility
        referrer: this.attributes.page_referrer || this.attributes.referrer || Util.documentReferrerOrDirect(),
        device_identifier: DeviceIdentifiers.getUserDeviceIdentifierValue(),
        page_view_identifier: SessionPersistance.get(SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY),
        sdk_version: SDK_VERSION,
        session_identifier: CookieHelper.getCookie(SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME),
        url: window.location.href,
        organization: PersistentMemoryManager.getOrganizationData(),
        user: PersistentMemoryManager.getIdentifiedUser(),
      },
    }
  }
}

export default Event;