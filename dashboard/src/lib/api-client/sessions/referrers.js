import Base from "../base";

export class Referrers extends Base {
  static async barChart({ timeframe, dataSource }) {
    return await this._get('/api/v1/sessions/referrers/bar_chart', { timeframe, dataSource })
  }
}

Object.assign(Referrers, Base);
export default Referrers;