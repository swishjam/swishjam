import Base from "../base";

export class RevenuePerCustomer extends Base {
  static async timeseries({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/revenue_per_customer', { timeframe })
  }
}

Object.assign(RevenuePerCustomer, Base);
export default RevenuePerCustomer;