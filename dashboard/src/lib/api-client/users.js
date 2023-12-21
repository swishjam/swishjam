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

  static async list({ where, page, limit } = {}) {
    return await this._get('/api/v1/users', { where: JSON.stringify(where), page, per_page: limit })
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/users/${id}`);
  }

  static async timeseries({ timeframe } = {}) {
    return await this._get(`/api/v1/users/timeseries`, { timeframe });
  }

  static async uniqueAttributeValues({ attributes } = {}) {
    return await this._get('/api/v1/users/unique_attributes', { columns: JSON.stringify(attributes) });
  }
}

Object.assign(Users, Base);
export default Users;