import Base from "../base";

export class Customers extends Base {
  static async timeseries({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/customers/timeseries', { timeframe });
  }
}

Object.assign(Customers, Base);
export default Customers;