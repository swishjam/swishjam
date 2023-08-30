import { Client } from "./client.mjs";

export default class Swishjam {
  static init = (options = {}) => {
    if (window.Swishjam) return window.Swishjam;
    window.Swishjam = Swishjam;
    Swishjam._client = new Client(options);
    return Swishjam;
  }

  static event = (eventName, properties) => Swishjam._client.record(eventName, properties);
  static identify = (userIdentifier, traits) => Swishjam._client.identify(userIdentifier, traits);
  static setOrganization = (organizationIdentifier, traits) => Swishjam._client.setOrganization(organizationIdentifier, traits);
  static getSession = () => Swishjam._client.getSession();
  static newSession = () => Swishjam._client.newSession();
}