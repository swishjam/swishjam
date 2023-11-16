import { DataPersister } from "./dataPersister.mjs";
import { DeviceDetails } from "./deviceDetails.mjs";
import { DeviceIdentifiers } from "./deviceIdentifiers.mjs";
import { ErrorHandler } from './errorHandler.mjs';
import { EventQueueManager } from "./eventQueueManager.mjs";
import { PageViewManager } from "./pageViewManager.mjs";
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
    return this.errorHandler.executeWithErrorHandling(() => (
      this.eventQueueManager.recordEvent(eventName, properties)
    ))
  }

  identify = (userIdentifier, traits = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      this._extractOrganizationFromIdentifyCall(traits)
      return this.record('identify', { userIdentifier, ...traits })
    })
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      // organizationId is only persisted so that we can check if setOrganization has been called before with a different organization
      const previouslySetOrganization = DataPersister.get('organizationId');
      // we only want to record the organization if it's different than the previously set organization
      if (previouslySetOrganization !== organizationIdentifier) {
        // if there was a previously defined organization, we need to start a new session
        // which will reset the organization identifier
        if (previouslySetOrganization) this.newSession();
        DataPersister.set('organizationId', organizationIdentifier);
        // at this point we will have a new organization device identifier
        return this.record('organization', { organizationIdentifier, ...traits })
      }
    });
  }

  getSession = () => {
    return this.errorHandler.executeWithErrorHandling(() => (
      DataPersister.get('sessionId')
    ));
  }

  newSession = ({ registerPageView = true } = {}) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      // important to set this first because the new_session Event needs to have the new sessionId
      DataPersister.set('sessionId', UUID.generate('s'));
      DataPersister.delete('organizationId');
      // because the organization device identifier only persists for the duration of the session
      // if this is a brand new session, this cookie would not have even been set yet, so this will set it
      // if the user called setOrganization or logout the organization device identifier will be rotated here
      DeviceIdentifiers.resetOrganizationDeviceIdentifierValue();

      this.record('new_session', {
        referrer: this.pageViewManager.previousUrl(),
        ...this.deviceDetails.all()
      });
      if (registerPageView) this.pageViewManager.recordPageView();
      return this.getSession();
    });
  }

  logout = () => {
    return this.errorHandler.executeWithErrorHandling(() => {
      DeviceIdentifiers.resetAllDeviceIdentifierValues();
      return this.newSession();
    });
  }

  _extractOrganizationFromIdentifyCall = identifyTraits => {
    const { organization, org } = identifyTraits;
    if (organization || org) {
      const extractedOrganizationData = organization || org;
      const { organizationIdentifier: extractedOrganizationIdentifier, orgIdentifier, identifier, organizationId, orgId, id } = extractedOrganizationData;
      const organizationIdentifier = extractedOrganizationIdentifier || orgIdentifier || identifier || organizationId || orgId || id;
      let orgTraits = {};
      Object.keys(extractedOrganizationData).forEach(key => {
        if (!['organizationIdentifier', 'orgIdentifier', 'identifier', 'organizationId', 'orgId', 'id'].includes(key)) {
          orgTraits[key] = extractedOrganizationData[key];
        }
      });
      this.setOrganization(organizationIdentifier, orgTraits);
    }
  }

  _initPageViewListeners = () => {
    return this.errorHandler.executeWithErrorHandling(() => {

      this.pageViewManager.onNewPage((_newUrl, previousUrl) => {
        return this.errorHandler.executeWithErrorHandling(() => {
          DataPersister.set('pageViewId', UUID.generate('pv'));
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