import Base from "../base";

export class Revenue extends Base {
  static async timeseries({ timeframe, excludeComparison }) {
    return await this._get('/api/v1/saas_metrics/revenue/timeseries', { timeframe, exclude_comparison: excludeComparison })
  }

  static async heatmap() {
    return await this._get('/api/v1/saas_metrics/revenue/heatmap')
  }

  static async perCustomerTimeseries({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/revenue/per_customer_timeseries', { timeframe })
  }

  static async retention({ numCohorts }) {
    return await this._get('/api/v1/saas_metrics/revenue/retention', { num_cohorts: numCohorts })
  }
}

Object.assign(Revenue, Base);
export default Revenue;