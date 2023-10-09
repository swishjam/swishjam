import Base from './base'

export class PageViews extends Base {
  static async timeseries({ timeframe, dataSource }) {
    return await this._get("/api/v1/page_views/timeseries", { timeframe, data_source: dataSource })
  }

  static async list({ timeframe, dataSource }) {
    return await this._get('/api/v1/page_views', { timeframe, data_source: dataSource })
  }
}

Object.assign(PageViews, Base);
export default PageViews;