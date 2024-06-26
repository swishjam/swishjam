import Base from "./base";
import Properties from "./events/properties";
import { Users } from "./events/users";

export class Events extends Base {
  static Properties = Properties;
  static Users = Users;

  static async list({ dataSource, userId, limit }) {
    return await this._get('/api/v1/events', { data_source: dataSource, user_id: userId, limit })
  }

  static async listUnique(options = {}) {
    return await this._get('/api/v1/events/unique', options)
  }

  static async count(event, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/count`, options)
  }

  static async sum(event, property, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/sum`, { property, ...options })
  }

  static async average(event, property, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/average`, { property, ...options })
  }

  static async maximum(event, property, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/maximum`, { property, ...options })
  }

  static async minimum(event, property, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(event)}/minimum`, { property, ...options })
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