import Base from "../base";

export class Referrers extends Base {
  static async list({ timeframe, data_source, limit }) {
    return await this._get("/api/v1/sessions/referrers", { timeframe, data_source, limit })
  }
}

Object.assign(Referrers, Base);

export default Referrers;