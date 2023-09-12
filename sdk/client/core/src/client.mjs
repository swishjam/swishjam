import { PageViewManager } from "./pageViewManager.mjs";
import { EventManager } from "./eventManager.mjs";
import { DataPersister } from "./dataPersister.mjs";
import { DeviceDetails } from "./deviceDetails";
import { UUID } from "./uuid.mjs";
import { SDK_VERSION } from './version.mjs'

export class Client {
  constructor(options = {}) {
    this.config = this._setConfig(options);
    this.eventManager = new EventManager(this.config);
    this.pageViewManager = new PageViewManager;
    // the order here is important, we want to make sure we have a session before we start listening for page views
    if (!this.getSession()) this.newSession({ registerPageView: false });
    this._initPageViewListeners();
    console.log('SwishjamJS Version:', SDK_VERSION)
  }

  record = (eventName, properties) => {
    return this.eventManager.recordEvent(eventName, properties);
  }

  identify = (userIdentifier, traits) => {
    this._extractOrganizationFromIdentifyCall(traits);
    return this.record('identify', { userIdentifier, ...traits });
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    const previouslySetOrganization = DataPersister.get('organizationId');
    // set the new organization so the potential new session has the correct organization
    DataPersister.set('organizationId', organizationIdentifier);
    // we assume anytime setOrganization is called with a new org, we want a new session
    if (previouslySetOrganization !== organizationIdentifier) this.newSession();
    this.record('organization', { organizationIdentifier, ...traits })
  }

  getSession = () => {
    return DataPersister.get('sessionId');
  }

  newSession = ({ registerPageView = true }) => {
    // important to set this first because the new Event reads from the DataPersister
    DataPersister.set('sessionId', UUID.generate('s'));
    this.record('new_session', { 
      referrer: this.pageViewManager.previousUrl(),
      ...DeviceDetails.all()
    });
    if (registerPageView) this.pageViewManager.recordPageView();
    return this.getSession();
  }

  _extractOrganizationFromIdentifyCall = identifyTraits => {
    const { organization, org } = identifyTraits;
    if (organization || org) {
      const extractedOrganizationData = organization || org;
      const { organizationIdentifier: extractedOrganizationIdentifier, orgIdentifier, identifier, organizationId, orgId, id } = extractedOrganizationData;
      const organizationIdentifier = extractedOrganizationIdentifier || orgIdentifier || identifier || organizationId || orgId || id;
      let orgTraits = {};
      Object.keys(extractedOrganizationData).forEach(key => {
        if(!['organizationIdentifier', 'orgIdentifier', 'identifier', 'organizationId', 'orgId', 'id'].includes(key)) {
          orgTraits[key] = extractedOrganizationData[key];
        }
      });
      this.setOrganization(organizationIdentifier, orgTraits);
    }
  }

  _initPageViewListeners = () => {
    this.pageViewManager.onNewPage((_newUrl, previousUrl) => {
      DataPersister.set('pageViewId', UUID.generate('pv'));
      this.eventManager.recordEvent('page_view', { referrer: previousUrl });
    });
    window.addEventListener('pagehide', async () => {
      debugger;
      this.eventManager.recordEvent('page_left');
      await this.eventManager.flushQueue();
    })
    this.pageViewManager.recordPageView();
  }

  _setConfig = options => {
    if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
    const validOptions = ['apiKey', 'apiEndpoint', 'maxEventsInMemory', 'reportingHeartbeatMs', 'marketingUrlPattern', 'productUrlPattern', 'debug'];
    Object.keys(options).forEach(key => {
      if (!validOptions.includes(key)) console.warn(`SwishjamJS received unrecognized config: ${key}`);
    });
    return {
      version: SDK_VERSION,
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint || 'https://api2.swishjam.com/api/v1/capture',
      maxEventsInMemory: options.maxEventsInMemory || 20,
      reportingHeartbeatMs: options.reportingHeartbeatMs || 10_000,
      marketingUrlRegExp: new RegExp(options.marketingUrlRegExp || "(www\.)?[^.]*\.[^.]*$"),
      productUrlRegExp: new RegExp(options.productUrlRegExp || "app\.[^.]*\.[^.]*$"),
      debug: typeof options.debug === 'boolean' ? options.debug : false,
    }
  }
}