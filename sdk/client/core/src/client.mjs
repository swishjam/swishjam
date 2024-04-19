import CookieHelper from "./cookieHelper.mjs";
import { DeviceIdentifiers } from "./deviceIdentifiers.mjs";
import { ErrorHandler } from './errorHandler.mjs';
import { EventQueueManager } from "./eventQueueManager.mjs";
import { InteractionHandler } from "./interactionHandler.mjs";
import { PageViewManager } from "./pageViewManager.mjs";
import { PersistentMemoryManager } from "./PersistentMemoryManager.mjs";
import { Requester } from "./requester.mjs";
import { SessionPersistance } from "./sessionPersistance.mjs";
import { Util } from "./util.mjs";

import {
  SDK_VERSION,
  SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME,
  SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY,
  SWISHJAM_SESSION_ATTRIBUTES_SESSION_STORAGE_KEY,
} from './constants.mjs'

const RESERVED_EVENT_NAMES = ['new_session', 'page_view', 'page_left', 'identify', 'organization', 'update_user', 'click', 'form_submit'];
const VALID_CONFIG_OPTIONS = [
  'apiKey', 'apiEndpoint', 'apiHost', 'apiPath', 'autoIdentify', 'disabled', 'disabledUrls', 'includedUrlParams',
  'maxEventsInMemory', 'recordClicks', 'recordFormSubmits', 'reportingHeartbeatMs', 'sessionTimeoutMinutes', 'useSegment',
];

export class Client {
  constructor(options = {}) {
    this.config = this._setConfig(options);
    this.requester = new Requester({ apiKey: this.config.apiKey, endpoint: this.config.apiEndpoint });
    this.errorHandler = new ErrorHandler(this.requester);
    this.eventQueueManager = new EventQueueManager(this.requester, this.errorHandler, {
      disabled: this.config.disabled,
      disabledUrls: this.config.disabledUrls,
      heartbeatMs: this.config.reportingHeartbeatMs,
      maxSize: this.config.maxEventsInMemory,
    });
    this.pageViewManager = new PageViewManager;
    this.interactionHandler = new InteractionHandler({
      autoIdentify: this.config.autoIdentify,
      recordClicks: this.config.recordClicks,
      recordFormSubmits: this.config.recordFormSubmits,
    });

    // the order here is important, we want to make sure we have a session before we register for page views in the _initPageViewListeners
    if (!this.getSession()) {
      this._setSessionAttributesInMemory();
      this.newSession({ registerPageView: false });
    }
    this._initPageViewListeners();
    this._initInteractionListeners();
    this._initSegmentListenersIfNecessary();
    this._recordInMemoryEvents();
  }

  record = (eventName, properties = {}) => {
    if (RESERVED_EVENT_NAMES.includes(eventName)) {
      throw new Error(`Cannot name a Swishjam event '${eventName}' because it is a reserved event name.`)
    }
    return this.errorHandler.executeWithErrorHandling(() => {
      this._registerNewSessionIfExceededTimeoutThresholdAndUpdateLastInteractionTime();
      return this.eventQueueManager.recordEvent(eventName, properties)
    })
  }

  reservedEvent = (eventName, properties = {}, options = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      // either use the provided option, or if it isn't a new_session or page_left event
      const checkForSessionTimeout = options.checkForSessionTimeout ?? !['new_session', 'page_left'].includes(eventName);
      if (checkForSessionTimeout) {
        this._registerNewSessionIfExceededTimeoutThresholdAndUpdateLastInteractionTime();
      }
      return this.eventQueueManager.recordEvent(eventName, properties)
    })
  }

  identify = (identifier, traits = {}) => {
    if (!identifier || identifier === 'undefined' || identifier === 'null') {
      console.error(`SwishjamJS: \`identify\` requires a unique identifier to be provided, received: ${identifier}`);
    } else {
      return this.errorHandler.executeWithErrorHandling(() => {
        const { organization, org, ...userTraits } = traits;
        const currentlyIdentifiedUser = PersistentMemoryManager.getCurrentUserData();
        if (Util.jsonIsEqual(currentlyIdentifiedUser, { ...userTraits, identifier })) {
          return;
        }
        PersistentMemoryManager.setCurrentUserData({ ...userTraits, auto_identified: false, identifier });
        const identifyEvent = this.reservedEvent('identify')
        if (organization || org) {
          const { id, identifier, ...orgTraits } = organization || org || {};
          if (id || identifier) {
            this.setOrganization(id || identifier, orgTraits);
          }
        }
        return identifyEvent;
      })
    }
  }

  updateUser = (traits = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      // not caching/checking if these traits are already applied
      PersistentMemoryManager.updateCurrentUserData(traits)
      return this.reservedEvent('update_user', { user: traits })
    })
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    if (!organizationIdentifier || organizationIdentifier === 'undefined' || organizationIdentifier === 'null') {
      console.error(`SwishjamJS: \`setOrganization\` requires a unique identifier to be provided, received: ${organizationIdentifier}`);
    } else {
      return this.errorHandler.executeWithErrorHandling(() => {
        const previouslySetOrgData = PersistentMemoryManager.getOrganizationData();
        const newOrgData = PersistentMemoryManager.setOrganizationData({ traits, identifier: organizationIdentifier });
        if (Util.jsonIsEqual(previouslySetOrgData, newOrgData)) return;
        const changedOrg = previouslySetOrgData.identifier !== organizationIdentifier;
        if (changedOrg) {
          this.newSession();
          return this.reservedEvent('organization', {}, { checkForSessionTimeout: false });
        } else {
          return this.reservedEvent('organization');
        }
      });
    }
  }

  getSession = () => {
    return this.errorHandler.executeWithErrorHandling(() => (
      CookieHelper.getCookie(SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME)
    ));
  }

  newSession = ({ registerPageView = true } = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      // important to set this first because new events will be created with this value
      CookieHelper.setCookie({ name: SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME, value: Util.generateUUID('s') });
      this.reservedEvent('new_session');
      if (registerPageView) this.pageViewManager.recordPageView();
      return this.getSession();
    });
  }

  logout = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      DeviceIdentifiers.resetUserDeviceIdentifierValue();
      PersistentMemoryManager.reset();
      SessionPersistance.clear();
      return this.newSession();
    });
  }

  _registerNewSessionIfExceededTimeoutThresholdAndUpdateLastInteractionTime = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      let createdNewSession = false;
      if (this.lastInteractionTime && (new Date() - this.lastInteractionTime) > (this.config.sessionTimeoutMinutes * 60 * 1_000)) {
        createdNewSession = true;
        SessionPersistance.clear();
        SessionPersistance.set(SWISHJAM_SESSION_ATTRIBUTES_SESSION_STORAGE_KEY, { session_referrer_url: 'timed_out_session' });
        this.newSession();
      }
      this.lastInteractionTime = new Date();
      return createdNewSession;
    });
  }

  _setSessionAttributesInMemory = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      let sessionAttributes = {
        session_referrer_url: Util.documentReferrerOrDirect(),
        session_landing_page_url: window.location.href,
      }
      this.config.includedUrlParams.forEach(param => {
        const value = Util.getUrlParam(param);
        if (value) {
          sessionAttributes[`session_${param}`] = value;
        }
      });
      SessionPersistance.set(SWISHJAM_SESSION_ATTRIBUTES_SESSION_STORAGE_KEY, sessionAttributes);
    });
  }

  _initPageViewListeners = () => {
    return this.errorHandler.executeWithErrorHandling(() => {

      this.pageViewManager.onNewPage((_newUrl, previousUrl) => {
        return this.errorHandler.executeWithErrorHandling(() => {
          SessionPersistance.set(SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY, Util.generateUUID('pv'));
          this.reservedEvent('page_view', { page_referrer: previousUrl });
        });
      });

      window.addEventListener('beforeunload', async () => {
        return this.errorHandler.executeWithErrorHandling(() => {
          this.reservedEvent('page_left', { milliseconds_on_page: this.pageViewManager.millisecondsOnCurrentPage() });
          this.eventQueueManager.flushQueue();
        });
      })

      this.pageViewManager.recordPageView();
    });
  }

  _initInteractionListeners = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      this.interactionHandler.onInteraction(({ type, attributes }) => {
        return this.errorHandler.executeWithErrorHandling(() => {
          if (type === 'setUser') {
            if (!PersistentMemoryManager.userIsIdentified()) {
              this.updateUser(attributes);
            }
          } else {
            this.reservedEvent(type, attributes);
          }
        });
      })
    })
  }

  _initSegmentListenersIfNecessary = (numAttempts = 0) => {
    if (!this.config.useSegment) return;
    return this.errorHandler.executeWithErrorHandling(() => {
      if (window.analytics) {
        window.analytics.on('identify', (id, properties, _options) => {
          this.identify(id, properties);
        });
        window.analytics.on('track', (event, properties, _options) => {
          this.record(event, properties);
        });
        window.analytics.on('group', (id, properties, _options) => {
          this.setOrganization(id, properties);
        });
        // window.analytics.on('page', ({ properties }) => {
        //   this.reservedEvent('page_view', properties);
        // });
      } else if (numAttempts < 6) {
        setTimeout(() => this._initSegmentListenersIfNecessary(numAttempts + 1), 250);
      } else {
        console.warn('[Swishjam SDK Error]: Could not find `window.analytics` object to attach Segment event listeners to within 1.5 seconds.');
      }
    });
  }

  _setConfig = options => {
    if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
    Object.keys(options).forEach(key => {
      if (!VALID_CONFIG_OPTIONS.includes(key)) console.warn(`[Swishjam SDK Warning]: received unrecognized config: ${key}`);
    });
    return {
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint || `${(options.apiHost || '').includes('localhost:') ? 'http' : 'https'}://${options.apiHost || 'capture.swishjam.com'}${options.apiPath || '/api/v1/capture'}`,
      autoIdentify: options.autoIdentify ?? true,
      disabled: options.disabled ?? false,
      disabledUrls: options.disabledUrls || ['http://localhost'],
      includedUrlParams: [...(options.includedUrlParams || []), 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'],
      maxEventsInMemory: parseInt(options.maxEventsInMemory || 20),
      recordClicks: options.recordClicks ?? true,
      recordFormSubmits: options.recordFormSubmits ?? true,
      reportingHeartbeatMs: parseInt(options.reportingHeartbeatMs || 2_500),
      sessionTimeoutMinutes: parseInt(options.sessionTimeoutMinutes || 30),
      useSegment: options.useSegment ?? false,
      version: SDK_VERSION,
    }
  }

  _recordInMemoryEvents = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      (window.swishjamEvents || []).forEach(({ method, args }) => {
        const func = { event: this.record, identify: this.identify, setOrganization: this.setOrganization, logout: this.logout }[method];
        if (func) func(...args)
      })
      delete window.swishjamEvents;
    });
  }
}

export default Client;