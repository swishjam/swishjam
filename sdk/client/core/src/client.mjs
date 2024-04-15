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

    // the order here is important, we want to make sure we have a session before we start register the page views in the _initPageViewListeners
    if (!this.getSession()) {
      this._setSessionAttributesInMemory();
      this.newSession({ registerPageView: false });
    }
    this._initPageViewListeners();
    this._initInteractionListeners();
    this._recordInMemoryEvents();
  }

  record = (eventName, properties = {}) => {
    if (['page_view', 'page_left', 'new_session', 'identify', 'organization'].includes(eventName)) {
      throw new Error(`Cannot name a Swishjam event '${eventName}' because it is a reserved event name.`)
    }
    return this.errorHandler.executeWithErrorHandling(() => (
      this.eventQueueManager.recordEvent(eventName, properties)
    ))
  }

  identify = (userIdentifier, traits = {}) => {
    if (!userIdentifier || userIdentifier === 'undefined' || userIdentifier === 'null') {
      console.error(`SwishjamJS: \`identify\` requires a unique identifier to be provided, received: ${userIdentifier}`);
    } else {
      return this.errorHandler.executeWithErrorHandling(() => {
        const { organization, org, ...userTraits } = traits;
        const identifyEvent = this.eventQueueManager.recordEvent('identify', { userIdentifier, auto_identified: false, ...userTraits })
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

  setUser = (traits = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      this.eventQueueManager.recordEvent('set_user', { user: traits })
    })
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    if (!organizationIdentifier || organizationIdentifier === 'undefined' || organizationIdentifier === 'null') {
      console.error(`SwishjamJS: \`setOrganization\` requires a unique identifier to be provided, received: ${organizationIdentifier}`);
    } else {
      return this.errorHandler.executeWithErrorHandling(() => {
        const { organization_identifier: previouslySetOrganizationIdentifier } = PersistentMemoryManager.getOrganizationData();
        PersistentMemoryManager.setOrganizationData(organizationIdentifier, traits);
        if (previouslySetOrganizationIdentifier && previouslySetOrganizationIdentifier !== organizationIdentifier) this.newSession();
        return this.eventQueueManager.recordEvent('organization', { organizationIdentifier, ...traits }, { includeOrganizationData: false });
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
      this.eventQueueManager.recordEvent('new_session');
      if (registerPageView) this.pageViewManager.recordPageView();
      return this.getSession();
    });
  }

  logout = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      DeviceIdentifiers.resetUserDeviceIdentifierValue();
      PersistentMemoryManager.reset();
      return this.newSession();
    });
  }

  _setSessionAttributesInMemory = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      let sessionAttributes = {
        session_referrer: document.referrer,
        session_landing_page_url: window.location.href,
      }
      this.config.includedUrlParams.forEach(param => {
        sessionAttributes[`session_${param}`] = Util.getUrlParam(param);
      });
      SessionPersistance.set(SWISHJAM_SESSION_ATTRIBUTES_SESSION_STORAGE_KEY, sessionAttributes);
    });
  }

  _initPageViewListeners = () => {
    return this.errorHandler.executeWithErrorHandling(() => {

      this.pageViewManager.onNewPage((_newUrl, previousUrl) => {
        return this.errorHandler.executeWithErrorHandling(() => {
          SessionPersistance.set(SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY, Util.generateUUID('pv'));
          this.eventQueueManager.recordEvent('page_view', { referrer: previousUrl });
        });
      });

      window.addEventListener('beforeunload', async () => {
        return this.errorHandler.executeWithErrorHandling(() => {
          this.eventQueueManager.recordEvent('page_left', { milliseconds_on_page: this.pageViewManager.millisecondsOnCurrentPage() });
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
            this.setUser(attributes);
          } else {
            this.eventQueueManager.recordEvent(type, attributes);
          }
        });
      })
    })
  }

  _setConfig = options => {
    if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
    const validOptions = [
      'apiKey', 'apiEndpoint', 'apiHost', 'apiPath', 'autoIdentify', 'disabled', 'disabledUrls', 'includedUrlParams',
      'maxEventsInMemory', 'recordClicks', 'recordFormSubmits', 'reportingHeartbeatMs'
    ];
    Object.keys(options).forEach(key => {
      if (!validOptions.includes(key)) console.warn(`SwishjamJS received unrecognized config: ${key}`);
    });
    return {
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint || `${(options.apiHost || '').includes('localhost:') ? 'http' : 'https'}://${options.apiHost || 'capture.swishjam.com'}${options.apiPath || '/api/v1/capture'}`,
      autoIdentify: options.autoIdentify ?? true,
      disabled: options.disabled ?? false,
      disabledUrls: options.disabledUrls || ['http://localhost'],
      includedUrlParams: [...(options.includedUrlParams || []), 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'],
      maxEventsInMemory: options.maxEventsInMemory || 20,
      recordClicks: options.recordClicks ?? true,
      recordFormSubmits: options.recordFormSubmits ?? true,
      reportingHeartbeatMs: options.reportingHeartbeatMs || 2_500,
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