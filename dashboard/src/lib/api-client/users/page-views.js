import Base from "../base";

export class PageViews extends Base {
  static async list(userId, { timeframe, limit, dataSource } = {}) {
    return await this._get(`/api/v1/users/${userId}/page_views`, { timeframe, limit, data_source: dataSource })
  }
}

Object.assign(PageViews, Base);
export default PageViews;