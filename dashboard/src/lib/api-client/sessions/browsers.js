import Base from "../base";

export class Browsers extends Base {
  static async barChart({ timeframe, dataSource }) {
    return await this._get('/api/v1/sessions/browsers/bar_chart', { timeframe, dataSource })
  }
}

Object.assign(Browsers, Base);
export default Browsers;