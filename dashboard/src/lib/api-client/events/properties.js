import Base from "../base";

export class Properties extends Base {
  static async list(eventName) {
    return await this._get(`/api/v1/events/${eventName}/properties`);
  }

  static async getCountsOfPropertyValues(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${eventName}/properties/${propertyName}/counts`, options);
  }
}

Object.assign(Properties, Base);
export default Properties;