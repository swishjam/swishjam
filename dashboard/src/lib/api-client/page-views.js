import Base from './base'

export class PageViews extends Base {
  static async timeseries({ timeframe, data_source }) {
    return await this._get("/api/v1/page_views/timeseries", { timeframe, data_source })
  }

  static async list({ timeframe, data_source }) {
    return await this._get('/api/v1/page_views', { timeframe, data_source })
  }
}

Object.assign(PageViews, Base);

export default PageViews;