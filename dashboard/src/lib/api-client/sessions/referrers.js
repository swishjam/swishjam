import Base from "../base";

export class Referrers extends Base {
  static async list({ timeframe, dataSource, limit }) {
    return await this._get("/api/v1/sessions/referrers", { timeframe, data_source: dataSource, limit })
  }
}

Object.assign(Referrers, Base);

export default Referrers;