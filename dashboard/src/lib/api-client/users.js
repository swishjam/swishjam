import Base from './base'
import Active from './users/active'
import Events from './users/event';
import PageViews from './users/page-views';
import Sessions from './users/sessions';

export class Users extends Base {
  static Active = Active;
  static Events = Events;
  static PageViews = PageViews;
  static Sessions = Sessions;

  static async list({ page, limit, userSegmentIds } = {}) {
    return await this._get('/api/v1/users', { page, per_page: limit, user_segment_ids: userSegmentIds })
  }

  static async count() {
    return await this._get('/api/v1/users/count');
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/users/${id}`);
  }

  static async timeseries({ timeframe } = {}) {
    return await this._get(`/api/v1/users/timeseries`, { timeframe });
  }

  static async uniqueProperties() {
    return await this._get('/api/v1/users/unique_properties');
  }

  static async uniqueAttributeValues({ attributes } = {}) {
    return await this._get('/api/v1/users/unique_property_values', { columns: JSON.stringify(attributes) });
  }
}

Object.assign(Users, Base);
export default Users;