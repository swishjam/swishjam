import Base from "../base";

export class PageViews extends Base {
  static async list(orgId, options = {}) {
    return await this._get(`/api/v1/organizations/${orgId}/page_views`, options)
  }
}

Object.assign(PageViews, Base);
export default PageViews;