import Base from "./base";
import Properties from "./events/properties";

export class Events extends Base {
  static Properties = Properties;

  static async listUnique() {
    return await this._get('/api/v1/events/unique')
  }

  static async count(event, options = {}) {
    return await this._get(`/api/v1/events/${event}/count`, options)
  }

  static async timeseries(event, property, options = {}) {
    return await this._get(`/api/v1/events/${event}/timeseries`, { property, ...options })
  }
}

Object.assign(Events, Base);
export default Events;