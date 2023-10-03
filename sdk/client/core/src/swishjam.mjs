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

  event = (eventName, properties) => this.__safely(this[_client].record(eventName, properties));
  identify = (userIdentifier, traits) => this.__safely(this[_client].identify(userIdentifier, traits));
  setOrganization = (organizationIdentifier, traits) => this.__safely(this[_client].setOrganization(organizationIdentifier, traits));
  getSession = () => this.__safely(this[_client].getSession());
  newSession = () => this.__safely(this[_client].newSession());
  logout = () => this.__safely(this[_client].logout());
  __safely = func => {
    try {
      func()
    } catch(err) {
      console.error(`Failed to run Swishjam method \`${func.name}\`: ${err.message}`);
    }
  }
}