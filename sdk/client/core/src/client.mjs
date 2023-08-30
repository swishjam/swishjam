import { PageViewManager } from "./pageViewManager.mjs";
import { DataHandler } from "./dataHandler.mjs";
import { Event } from "./event.mjs";
import { MemoryHandler } from "./memoryHandler.mjs";
import { UUID } from "./uuid.mjs";

export class Client {
  constructor(options = {}) {
    this.config = this._setConfig(options);
    this.dataHandler = this._initDataHandler(this.config);
    if (!this.getSession()) this.newSession();
    this.pageViewManager = this._initPageViewTracker();
  }

  record = (eventName, properties) => {
    const event = new Event(eventName, properties);
    this.dataHandler.add(event);
  }

  identify = (userIdentifier, traits) => {
    this._extractOrganizationFromIdentifyCall(traits);
    return this.record('identify', { userIdentifier, ...traits });
  }

  setOrganization = (organizationIdentifier, traits = {}) => {
    const previouslySetOrganization = MemoryHandler.get('organizationId');
    if (previouslySetOrganization !== organizationIdentifier) {
      // do we want to assume anytime setOrganization is called with a new org, we want a new session?
      this.newSession();
    }
    MemoryHandler.set('organizationId', organizationIdentifier);
    this.record('organization', { organizationIdentifier, ...traits })
  }

  getSession = () => {
    return MemoryHandler.get('sessionId');
  }

  newSession = () => {
    const safeParsedReferrer = () => {
      try {
        return this.pageViewManager ? new URL(this.pageViewManager.previousUrl()) : new URL(document.referrer);
      } catch(err) {
        return {};
      }
    }
    // important to set this first because the new Event reads from the MemoryHandler
    MemoryHandler.set('sessionId', UUID.generate('s'));
    this.record('new_session', { 
      referrer_url: safeParsedReferrer().href,
      referrer_url_host: safeParsedReferrer().host,
      referrer_url_path: safeParsedReferrer().pathname,
      referrer_url_query: safeParsedReferrer().search,
      utm_source: new URLSearchParams(document.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(document.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(document.location.search).get('utm_campaign'),
      utm_term: new URLSearchParams(document.location.search).get('utm_term'),
      utm_content: new URLSearchParams(document.location.search).get('utm_content'),
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
        if(!['organizationIdentifier', 'orgIdentifier', 'identifier', 'organizationId', 'orgId', 'id'].includes(key)) {
          orgTraits[key] = extractedOrganizationData[key];
        }
      });
      this.setOrganization(organizationIdentifier, orgTraits);
    }
  }

  _initDataHandler = config => {
    return new DataHandler({
      apiEndpoint: config.apiEndpoint,
      apiKey: config.apiKey,
      maxSize: config.maxEventsInMemory,
      heartbeatMs: config.reportingHeartbeatMs
    });
  }

  _initPageViewTracker = () => {
    const pageViewManager = new PageViewManager;
    pageViewManager.onNewPage((_newUrl, previousUrl) => {
      MemoryHandler.set('pageViewId', UUID.generate('pv'));
      const pageViewEvent = new Event('page_view', { previousUrl });
      this.dataHandler.add(pageViewEvent);
    })
    pageViewManager.trackPageView();
    return pageViewManager;
  }

  _setConfig = options => {
    if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
    const validOptions = ['apiKey', 'apiEndpoint', 'maxEventsInMemory', 'reportingHeartbeatMs'];
    Object.keys(options).forEach(key => {
      if (!validOptions.includes(key)) console.warn(`Swishjam received unrecognized config: ${key}`);
    });
    return {
      version: '0.0.01',
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint || 'http://localhost:3000/api/v1/capture',
      maxEventsInMemory: options.maxEventsInMemory || 20,
      reportingHeartbeatMs: options.reportingHeartbeatMs || 10_000,
      debug: typeof options.debug === 'boolean' ? options.debug : false,
    }
  }
}