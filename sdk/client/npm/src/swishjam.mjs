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

  static identify = (userId, traits) => {
    const { organizationId, organization, org, orgId } = traits;
    if (organizationId || organization || org || orgId) {
      this.setOrganization(organizationId || organization || org || orgId);
    }
    this._record('identify', { userId, ...traits });
  }

  static setOrganization = organizationIdentifier => {
    const currentOrganization = MemoryHandler.get('organizationId');
    MemoryHandler.set('organizationId', organizationIdentifier);
    if (currentOrganization && currentOrganization !== organizationIdentifier) {
      // do we want to assume anytime setOrganization is called with a new org, we want a new session?
      this.newSession();
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
      const pageViewEvent = new Event('page', { previousUrl });
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