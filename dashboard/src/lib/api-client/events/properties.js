import Base from "../base";

export class Properties extends Base {
  static async list(eventName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/properties`, options);
  }

  static listUnique = this.list;

  static async sum(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/properties/${window.encodeURIComponent(propertyName)}/sum`, options);
  }

  static async average(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/properties/${window.encodeURIComponent(propertyName)}/average`, options);
  }

  static async maximum(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/properties/${window.encodeURIComponent(propertyName)}/maximum`, options);
  }

  static async minimum(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/properties/${window.encodeURIComponent(propertyName)}/minimum`, options);
  }

  static async getCountsOfPropertyValues(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/properties/${window.encodeURIComponent(propertyName)}/counts`, options);
  }

  static async barChartForProperty(eventName, propertyName, options = {}) {
    return await this._get(`/api/v1/events/${eventName}/properties/${propertyName}/stacked_bar_chart`, options);
  }
}

Object.assign(Properties, Base);
export default Properties;