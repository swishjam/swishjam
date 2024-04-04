import Base from "../base";

export class Sessions extends Base {
  static async timeseries(organizationId, { timeframe, dataSource } = {}) {
    return await this._get(`/api/v1/organizations/${organizationId}/sessions/timeseries`, { timeframe, data_source: dataSource })
  }
}

Object.assign(Sessions, Base);
export default Sessions;