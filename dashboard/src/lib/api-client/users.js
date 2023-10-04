import Base from './base'
import PageViews from './users/page-views';
import Active from './users/active'
import Events from './users/event';
import Sessions from './users/sessions';

export class Users extends Base {
  static Active = Active;
  static Events = Events;
  static PageViews = PageViews;
  static Sessions = Sessions;

  static async list({ page, limit } = {}) {
    return await this._get('/api/v1/users', { page, per_page: limit })
  }
  
  static async get(id) {
    return await this._get(`/api/v1/users/${id}`);
  }
}

Object.assign(Users, Base);

export default Users;