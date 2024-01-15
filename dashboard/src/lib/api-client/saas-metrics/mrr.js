import Base from "../base";

export class Mrr extends Base {
  static async timeseries({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/mrr/timeseries', { timeframe });
  }
}

Object.assign(Mrr, Base);
export default Mrr;