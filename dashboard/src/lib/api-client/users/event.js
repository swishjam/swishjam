import Base from "../base";

export class Events extends Base {
  static async list(userId, options = {}) {
    return await this._get(`/api/v1/users/${userId}/events`, options)
  }
}

Object.assign(Events, Base);
export default Events;