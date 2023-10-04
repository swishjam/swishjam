import Base from "../base";

export class PageViews extends Base {
  static async list(userId) {
    return await this._get(`/api/v1/users/${userId}/page_views`)
  }
}

Object.assign(PageViews, Base);
export default PageViews;