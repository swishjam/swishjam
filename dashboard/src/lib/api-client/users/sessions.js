import Base from "../base";

export class Sessions extends Base {
  static async timeseries(userId) {
    return await this._get(`/api/v1/users/${userId}/sessions/timeseries`)
  }

  static async timeline(userId) {
    return await this._get(`/api/v1/users/${userId}/sessions/timeline`)
  }
}

Object.assign(Sessions, Base);
export default Sessions;