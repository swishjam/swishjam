import { Client } from "./client.mjs";

export default class Swishjam {
  static init = (options = {}) => {
    if (window.Swishjam) return window.Swishjam;
    this._client = new Client(options);
    window.Swishjam = this;
    return this;
  }

  static event = (eventName, properties) => window.Swishjam._client.record(eventName, properties);
  static identify = (userIdentifier, traits) => window.Swishjam._client.identify(userIdentifier, traits);
  static setOrganization = (organizationIdentifier, traits) => window.Swishjam._client.setOrganization(organizationIdentifier, traits);
  static getSession = () => window.Swishjam._client.getSession();
  static newSession = () => window.Swishjam._client.newSession();
}