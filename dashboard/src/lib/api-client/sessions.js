import Base from './base'
import Referrers from './sessions/referrers';

export class Sessions extends Base {
  static Referrers = Referrers;
  
  static async timeseries({ timeframe, data_source }) {
    return await this._get("/api/v1/sessions/timeseries", { timeframe, data_source });
  }

  static async demographics({ timeframe, data_source }) {
    return await this._get("/api/v1/sessions/demographics", { timeframe, data_source });
  }
}

Object.assign(Sessions, Base)

export default Sessions;