import Base from "./base";
import Properties from "./events/properties";

export class Events extends Base {
  static Properties = Properties;

  static async listUnique(options = {}) {
    return await this._get('/api/v1/events/unique', options)
  }

  static async count(event, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/count`, options)
  }

  static async timeseries(event, property, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/timeseries`, { property, ...options })
  }

  static async retrieve(name, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(name)}`, options)
  }
}

Object.assign(Events, Base);
export default Events;