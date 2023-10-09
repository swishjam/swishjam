import Base from './base'
import Referrers from './sessions/referrers';

export class Sessions extends Base {
  static Referrers = Referrers;

  static async timeseries({ timeframe, dataSource }) {
    return await this._get("/api/v1/sessions/timeseries", { timeframe, data_source: dataSource });
  }

  static async demographics({ timeframe, dataSource }) {
    return await this._get("/api/v1/sessions/demographics", { timeframe, data_source: dataSource });
  }
}

Object.assign(Sessions, Base)

export default Sessions;