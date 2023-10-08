import Base from '../base'

export class Active extends Base {
  static async timeseries({ timeframe, data_source, type, include_comparison = false }) {
    return await this._get("/api/v1/users/active", { timeframe, data_source, type, include_comparison })
  }
}

Object.assign(Active, Base);

export default Active;