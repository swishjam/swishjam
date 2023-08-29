import { Client } from "./client.mjs";

export default class Swishjam {
  static init = (options = {}) => {
    if (window.Swishjam) return window.Swishjam;
    this._client = new Client(options);
    return this;
  }

  static event = (eventName, properties) => this._client.record(eventName, properties);
  static identify = (userIdentifier, traits) => this._client.identify(userIdentifier, traits);
  static setOrganization = (organizationIdentifier, traits) => this._client.setOrganization(organizationIdentifier, traits);
  static getSession = () => this._client.getSession();
  static newSession = () => this._client.newSession();
}