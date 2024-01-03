import CookieHelper from "./cookieHelper.mjs";
import { DeviceDetails } from "./deviceDetails.mjs";
import { DeviceIdentifiers } from "./deviceIdentifiers.mjs";
import { ErrorHandler } from './errorHandler.mjs';
import { EventQueueManager } from "./eventQueueManager.mjs";
import { InteractionHandler } from "./interactionHandler.mjs";
import { PageViewManager } from "./pageViewManager.mjs";
import { PersistentUserDataManager } from "./persistentUserDataManager.mjs";
import { Requester } from "./requester.mjs";
import { SessionPersistance } from "./sessionPersistance.mjs";
import { Util } from "./util.mjs";

import {
  SDK_VERSION,
  SWISHJAM_SESSION_IDENTIFIER_COOKIE_NAME,
  SWISHJAM_PAGE_VIEW_IDENTIFIER_SESSION_STORAGE_KEY
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
    this.deviceDetails = new DeviceDetails;
    this.interactionHandler = new InteractionHandler({
      recordClicks: this.config.recordClicks,
      recordFormSubmits: this.config.recordFormSubmits,
    });
    // the order here is important, we want to make sure we have a session before we start register the page views in the _initPageViewListeners
    if (!this.getSession()) this.newSession({ registerPageView: false });
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
    return this.errorHandler.executeWithErrorHandling(() => {
      // set the persistent user data first so the event is created with the correct user data
      const userTraits = Object.keys(traits).reduce((acc, key) => {
        if (!['organization', 'org'].includes(key)) {
          acc[key] = traits[key];
        }
        return acc;
      }, {})
      PersistentUserDataManager.setUserAttributes({ userIdentifier, ...userTraits });
      const identifyEvent = this.eventQueueManager.recordEvent('identify', { userIdentifier, ...userTraits })
      const extractedOrgData = this._extractOrganizationFromIdentifyCall(traits);
      if (extractedOrgData) {
        const [maybeOrganizationIdentifier, maybeOrganizationTraits] = extractedOrgData;
        this.setOrganization(maybeOrganizationIdentifier, maybeOrganizationTraits);
      }
      return identifyEvent;
    })
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      const previouslySetOrganization = PersistentUserDataManager.get('organization_identifier');
      // set the new organization so the potential new session has the correct organization
      const maybeOrgName = traits.name || traits.organizationName || traits.organization_name || traits.orgName || traits.org_name;
      const filteredTraits = Object.keys(traits).reduce((acc, key) => {
        if (!['name', 'organizationName', 'organization_name', 'orgName', 'org_name'].includes(key)) {
          acc[key] = traits[key];
        }
        return acc;
      }, {})
      // we store all setOrganization calls to persistent storage so it will be included in all future events/sessions
      // we may eventually want to make this configurable (ie: only make it session based), but for now we will always store it
      PersistentUserDataManager.setOrganizationAttributes({
        organizationIdentifier,
        organizationName: maybeOrgName,
        ...filteredTraits
      });
      // we assume anytime setOrganization is called with a new org, we want a new session
      if (previouslySetOrganization && previouslySetOrganization !== organizationIdentifier) this.newSession();
      return this.eventQueueManager.recordEvent('organization', { organizationIdentifier, ...traits }, { includeOrganizationData: false });
    });
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

      PersistentUserDataManager.setIfNull('initial_url', window.location.href);
      PersistentUserDataManager.setIfNull('initial_referrer', document.referrer);

      const previousSessionStartedAt = PersistentUserDataManager.get('previous_session_started_at');
      PersistentUserDataManager.set('previous_session_started_at', new Date());

      let userVisitStatus = 'new';
      if (previousSessionStartedAt) {
        const msSinceLastSession = new Date() - new Date(previousSessionStartedAt);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (msSinceLastSession > oneDayInMs * 30) {
          userVisitStatus = 'resurrecting';
        } else {
          userVisitStatus = 'returning';
        }
      }
      SessionPersistance.set('userVisitStatus', userVisitStatus)

      this.eventQueueManager.recordEvent('new_session', {
        referrer: document.referrer,
        ...this.deviceDetails.all()
      });
      if (registerPageView) this.pageViewManager.recordPageView();
      return this.getSession();
    });
  }

  logout = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      DeviceIdentifiers.resetUserDeviceIdentifierValue();
      PersistentUserDataManager.reset();
      return this.newSession();
    });
  }

  _extractOrganizationFromIdentifyCall = identifyTraits => {
    const { organization, org } = identifyTraits;
    if (organization || org) {
      const extractedOrganizationData = organization || org;
      if (typeof extractedOrganizationData === 'string') {
        return [extractedOrganizationData, {}];
      } else {
        const { id, identifier, orgIdentifier, org_identifier, organizationId, ogranization_id, orgId, org_id } = extractedOrganizationData;
        const organizationIdentifier = id || identifier || orgIdentifier || org_identifier || organizationId || ogranization_id || orgId || org_id;
        if (organizationIdentifier) {
          let orgTraits = {};
          Object.keys(extractedOrganizationData).forEach(key => {
            if (!['id', 'identifier', 'orgIdentifier', 'org_identifier', 'organizationId', 'organization_id', 'orgId', 'org_id'].includes(key)) {
              orgTraits[key] = extractedOrganizationData[key];
            }
          });
          return [organizationIdentifier, orgTraits];
        } else {
          console.warn('SwishjamJS: identify call included an organization object but did not include an organizationIdentifier. Organization object was ignored.')
        }
      }
    }
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
          this.eventQueueManager.recordEvent(type, attributes);
        });
      })
    })
  }

  _setConfig = options => {
    if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
    const validOptions = ['apiKey', 'apiEndpoint', 'maxEventsInMemory', 'reportingHeartbeatMs', 'debug', 'disabledUrls', 'disabled'];
    Object.keys(options).forEach(key => {
      if (!validOptions.includes(key)) console.warn(`SwishjamJS received unrecognized config: ${key}`);
    });
    return {
      version: SDK_VERSION,
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint || 'https://capture.swishjam.com/api/v1/capture',
      maxEventsInMemory: options.maxEventsInMemory || 20,
      reportingHeartbeatMs: options.reportingHeartbeatMs || 2_500,
      disabledUrls: options.disabledUrls || ['http://localhost'],
      disabled: typeof options.disabled === 'boolean' ? options.disabled : false,
      debug: typeof options.debug === 'boolean' ? options.debug : false,
      recordClicks: typeof options.recordClicks === 'boolean' ? options.recordClicks : true,
      recordFormSubmits: typeof options.recordFormSubmits === 'boolean' ? options.recordFormSubmits : true,
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