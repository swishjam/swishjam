import Base from "../base";

export class Churn extends Base {
  static async timeseries({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/churn/timeseries', { timeframe });
  }
}

Object.assign(Churn, Base);
export default Churn;