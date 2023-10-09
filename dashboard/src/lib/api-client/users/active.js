import Base from '../base'

export class Active extends Base {
  static async timeseries({ timeframe, dataSource, type, includeComparison = false }) {
    return await this._get("/api/v1/users/active", { timeframe, data_source: dataSource, type, include_comparison: includeComparison })
  }
}

Object.assign(Active, Base);

export default Active;