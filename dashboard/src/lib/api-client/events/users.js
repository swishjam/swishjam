import Base from "../base"

export class Users extends Base {
  static async list(eventName, options = {}) {
    return await this._get(`/api/v1/events/${window.encodeURIComponent(eventName)}/users`, options);
  }
}