import Base from "../base";

export class ChurnRate extends Base {
  static async timeseries({ includeComparison, timeframe }) {
    return await this._get('/api/v1/saas_metrics/churn_rate/timeseries', { include_comparison: false, timeframe });
  }
}

Object.assign(ChurnRate, Base);
export default ChurnRate;