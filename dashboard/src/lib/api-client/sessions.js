import Base from './base'
import Browsers from './sessions/browsers';
import DeviceTypes from './sessions/device-types';
import Referrers from './sessions/referrers';
import UrlParameters from './sessions/url-parameters';

export class Sessions extends Base {
  static Browsers = Browsers;
  static DeviceTypes = DeviceTypes;
  static Referrers = Referrers;
  static UrlParameters = UrlParameters;

  static async timeseries({ timeframe, dataSource }) {
    return await this._get("/api/v1/sessions/timeseries", { timeframe, data_source: dataSource });
  }

  static async demographics({ timeframe, dataSource }) {
    return await this._get("/api/v1/sessions/demographics", { timeframe, data_source: dataSource });
  }
}

Object.assign(Sessions, Base)

export default Sessions;