import { Client } from "./client.mjs";

const _client = Symbol('client');

export default class Swishjam {
  constructor (options) {
    if (window.Swishjam && !window.Swishjam.stubbed) {
      console.warn('SwishjamJS already initialized. Returning existing instance.');
      return window.Swishjam;
    }
    this[_client] = new Client(options);
    this.config = this[_client].config;
    window.Swishjam = this;
    return this;
  }

  event = (eventName, properties) => this[_client].record(eventName, properties);
  identify = (userIdentifier, traits) => this[_client].identify(userIdentifier, traits);
  setOrganization = (organizationIdentifier, traits) => this[_client].setOrganization(organizationIdentifier, traits);
  getSession = () => this[_client].getSession();
  newSession = () => this[_client].newSession();
}