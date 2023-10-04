import Base from "../../base";

export class Active extends Base {
  static async timeseries(orgId, { timeframe, includeComparison = false, type = 'weekly', dataSource = 'product' }) {
    return await this._get(`/api/v1/organizations/${orgId}/users/active`, { timeframe, type, data_source: dataSource, include_comparison: includeComparison })
  }
}

Object.assign(Active, Base);
export default Active;