import Base from './base'

export class PageViews extends Base {
  static async timeseries({ timeframe, dataSource }) {
    return await this._get("/api/v1/page_views/timeseries", { timeframe, dataSource })
  }

  static async barChart({ timeframe, dataSource }) {
    return await this._get('/api/v1/page_views/bar_chart', { timeframe, dataSource })
  }

  static async list({ timeframe, dataSource }) {
    return await this._get('/api/v1/page_views', { timeframe, dataSource })
  }
}

Object.assign(PageViews, Base);
export default PageViews;