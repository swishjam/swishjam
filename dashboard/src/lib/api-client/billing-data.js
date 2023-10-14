import Base from "./base";

export class BillingData extends Base {
  static async timeseries({ timeframe }) {
    return await this._get('/api/v1/billing_data_snapshots', { timeframe })
  }
}

Object.assign(BillingData, Base)

export default BillingData;