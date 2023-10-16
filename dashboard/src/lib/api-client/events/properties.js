import Base from "../base";

export class Properties extends Base {
  static async list(eventName, options = {}) {
    return await this._get(`/api/v1/events/${window.decodeURIComponent(eventName)}/properties`, options);
  }

  static listUnique = this.list;

  static async getCountsOfPropertyValues(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${window.decodeURIComponent(eventName)}/properties/${window.decodeURIComponent(propertyName)}/counts`, options);
  }
}

Object.assign(Properties, Base);
export default Properties;