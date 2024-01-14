import Base from "../base";

export class ChurnRate extends Base {
  static async timeseries({ excludeComparison, timeframe }) {
    return await this._get('/api/v1/saas_metrics/churn_rate/timeseries', { exclude_comparison: excludeComparison, timeframe });
  }
}

Object.assign(ChurnRate, Base);
export default ChurnRate;