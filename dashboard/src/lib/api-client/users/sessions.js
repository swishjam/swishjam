import Base from "../base";

export class Sessions extends Base {
  static async timeseries(userId) {
    return await this._get(`/api/v1/users/${userId}/sessions/timeseries`)
  }
}

Object.assign(Sessions, Base);
export default Sessions;