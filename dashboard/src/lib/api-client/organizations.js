import Base from "./base";
import PageViews from "./organizations/page-views";
import Users from "./organizations/users";

export class Organizations extends Base {
  static PageViews = PageViews;
  static Users = Users;

  static async list({ page, limit } = {}) {
    return await this._get('/api/v1/organizations', { page, per_page: limit });
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/organizations/${id}`)
  }
}

Object.assign(Organizations, Base);
export default Organizations;