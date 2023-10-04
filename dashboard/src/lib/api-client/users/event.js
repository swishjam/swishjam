import Base from "../base";

export class Events extends Base {
  static async list(userId) {
    return await this._get(`/api/v1/users/${userId}/events`)
  }
}

Object.assign(Events, Base);
export default Events;