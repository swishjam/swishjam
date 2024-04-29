import Base from "./base";

export class DataViz extends Base {
  static async barChart(options) {
    return await this._get('/api/v1/data_viz/stacked_bar_chart', options);
  }

  static async timeseries(options) {
    return await this._get('/api/v1/data_viz/timeseries', options);
  }

  static async value(options) {
    return await this._get('/api/v1/data_viz/value', options);
  }
}

Object.assign(DataViz, Base);
export default DataViz;