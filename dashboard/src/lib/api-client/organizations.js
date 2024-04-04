import Base from "./base";
import Events from "./organizations/events";
import PageViews from "./organizations/page-views";
import Sessions from "./organizations/sessions";
import Users from "./organizations/users";

export class Organizations extends Base {
  static Events = Events;
  static PageViews = PageViews;
  static Sessions = Sessions;
  static Users = Users;

  static async list({ page, limit, cohortIds } = {}) {
    return await this._get('/api/v1/organizations', { page, per_page: limit, cohort_ids: cohortIds });
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/organizations/${id}`)
  }

  static async uniqueProperties() {
    return await this._get('/api/v1/organizations/unique_properties');
  }

  static async count() {
    return await this._get('/api/v1/organizations/count');
  }
}

Object.assign(Organizations, Base);
export default Organizations;