import Base from "./base";

export class BillingData extends Base {
  static async timeseries({ timeframe, groupBy }) {
    return await this._get('/api/v1/billing_data_snapshots', { timeframe, group_by: groupBy })
  }
}

Object.assign(BillingData, Base)

export default BillingData;