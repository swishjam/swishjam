import Base from "../base";

export class DeviceTypes extends Base {
  static async barChart({ timeframe, dataSource }) {
    return await this._get('/api/v1/sessions/device_types/bar_chart', { timeframe, dataSource })
  }
}

Object.assign(DeviceTypes, Base);
export default DeviceTypes;