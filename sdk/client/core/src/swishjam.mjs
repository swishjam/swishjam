import { PageViewManager } from "./pageViewManager.mjs";
import { DataHandler } from "./dataHandler.mjs";
import { Event } from "./event.mjs";
import { MemoryHandler } from "./memoryHandler.mjs";
import { UUID } from "./uuid.mjs";

export default class Swishjam {
  static init = (options = {}) => {
    if (window.Swishjam) return window.Swishjam;
    window.Swishjam = this;
    this.config = this._setConfig(options);
    this.dataHandler = this._initDataHandler(this.config);
    if (!MemoryHandler.get('sessionId')) this.newSession();
    this._initPageViewTracker();

    return this;
  }

  static event = (eventName, properties) => this._record(eventName, properties);
  static getSession = () => MemoryHandler.get('sessionId');
  static getPageView = () => MemoryHandler.get('pageViewId');
  static newSession = () => MemoryHandler.set('sessionId', UUID.generate('s'));

  static identify = (userIdentifier, traits) => {
    this._extractOrganizationFromIdentifyCall(traits);
    this._record('identify', { userIdentifier, ...traits });
  }

  static setOrganization = (organizationIdentifier, traits = {}) => {
    const currentOrganization = MemoryHandler.get('organizationId');
    if (currentOrganization && currentOrganization !== organizationIdentifier) {
      // do we want to assume anytime setOrganization is called with a new org, we want a new session?
      this.newSession();
    }
    MemoryHandler.set('organizationId', organizationIdentifier);
    this._record('organization', { organizationIdentifier, ...traits })
  }

  static _extractOrganizationFromIdentifyCall = identifyTraits => {
    const { organization, org } = identifyTraits;
    if (organization || org) {
      const extractedOrganizationData = organization || org;
      const { organizationId, orgId, id } = extractedOrganizationData;
      const organizationIdentifier = organizationId || orgId || id;
      const traits = Object.keys(extractedOrganizationData).reduce((result, key) => {
        if (key !== 'organizationId' && key !== 'orgId' && key !== 'id') {
          result[key] = extractedOrganizationData[key];
        }
        return result;
      });
      this.setOrganization(organizationIdentifier, traits);
    }
  }

  static _record = (eventName, properties) => {
    if (!window.Swishjam) throw new Error('Swishjam not initialized, cannot record event');
    const event = new Event(eventName, properties);
    window.Swishjam.dataHandler.add(event);
  }

  static _initDataHandler = config => {
    return new DataHandler({
      apiEndpoint: config.apiEndpoint,
      apiKey: config.apiKey,
      maxSize: config.maxEventsInMemory,
      heartbeatMs: config.reportingHeartbeatMs
    });
  }

  static _initPageViewTracker = () => {
    new PageViewManager(({ previousUrl }) => {
      MemoryHandler.set('pageViewId', UUID.generate('pv'));
      const pageViewEvent = new Event('page_view', { previousUrl });
      window.Swishjam.dataHandler.add(pageViewEvent);
    }).trackPageView();
  }

  static _setConfig = options => {
    if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
    return {
      version: '0.0.01',
      apiKey: options.apiKey,
      apiEndpoint: options.apiEndpoint || 'http://localhost:3000/api/v1/capture',
      maxEventsInMemory: options.maxEventsInMemory || 20,
      reportingHeartbeatMs: options.reportingHeartbeatMs || 10_000
    }
  }
}