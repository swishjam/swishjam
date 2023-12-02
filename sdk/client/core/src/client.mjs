import { SessionPersistance } from "./sessionPersistance.mjs";
import { DeviceDetails } from "./deviceDetails.mjs";
import { DeviceIdentifiers } from "./deviceIdentifiers.mjs";
import { ErrorHandler } from './errorHandler.mjs';
import { EventQueueManager } from "./eventQueueManager.mjs";
import { PageViewManager } from "./pageViewManager.mjs";
import { PersistentUserDataManager } from "./persistentUserDataManager.mjs";
import { Requester } from "./requester.mjs";
import { SDK_VERSION } from './constants.mjs'
import { UUID } from "./uuid.mjs";

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
    // the order here is important, we want to make sure we have a session before we start register the page views in the _initPageViewListeners
    if (!this.getSession()) this.newSession({ registerPageView: false });
    this._initPageViewListeners();
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
      this._extractOrganizationFromIdentifyCall(traits);
      PersistentUserDataManager.setUserAttributes(traits);
      return this.eventQueueManager.recordEvent('identify', { userIdentifier, ...traits })
    })
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      const previouslySetOrganization = SessionPersistance.get('organizationId');
      // set the new organization so the potential new session has the correct organization
      SessionPersistance.set('organizationId', organizationIdentifier);
      // we assume anytime setOrganization is called with a new org, we want a new session
      if (previouslySetOrganization && previouslySetOrganization !== organizationIdentifier) this.newSession();
      this.eventQueueManager.recordEvent('organization', { organizationIdentifier, ...traits })
    });
  }

  getSession = () => {
    return this.errorHandler.executeWithErrorHandling(() => (
      SessionPersistance.get('sessionId')
    ));
  }

  newSession = ({ registerPageView = true } = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      // important to set this first because the new Event reads from the SessionPersistance
      SessionPersistance.set('sessionId', UUID.generate('s'));

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
      const { extractedOrganizationIdentifier, orgIdentifier, identifier, organizationId, orgId, id } = extractedOrganizationData;
      const organizationIdentifier = extractedOrganizationIdentifier || orgIdentifier || identifier || organizationId || orgId || id;
      let orgTraits = {};
      Object.keys(extractedOrganizationData).forEach(key => {
        if (!['organizationIdentifier', 'orgIdentifier', 'identifier', 'organizationId', 'orgId', 'id'].includes(key)) {
          orgTraits[key] = extractedOrganizationData[key];
        }
      });
      if (organizationIdentifier) {
        // this will call the organization event before the identify event, is that best? or should identify come first?
        this.setOrganization(organizationIdentifier, orgTraits);
      } else {
        console.warn('SwishjamJS: identify call included an organization object but did not include an organizationIdentifier. Organization object was ignored.')
      }
    }
  }

  _initPageViewListeners = () => {
    return this.errorHandler.executeWithErrorHandling(() => {

      this.pageViewManager.onNewPage((_newUrl, previousUrl) => {
        return this.errorHandler.executeWithErrorHandling(() => {
          SessionPersistance.set('pageViewId', UUID.generate('pv'));
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
      reportingHeartbeatMs: options.reportingHeartbeatMs || 10_000,
      disabledUrls: options.disabledUrls || ['http://localhost'],
      disabled: typeof options.disabled === 'boolean' ? options.disabled : false,
      debug: typeof options.debug === 'boolean' ? options.debug : false,
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