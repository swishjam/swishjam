import Base from "./base";

export class UserSegments extends Base {
  static async create({ name, description, queryFilterGroups }) {
    return await this._post('/api/v1/user_segments', { name, description, query_filter_groups: queryFilterGroups })
  }

  static async list({ page, perPage } = {}) {
    return await this._get('/api/v1/user_segments', { page, perPage })
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/user_segments/${id}`)
  }
}

Object.assign(UserSegments, Base);
export default UserSegments;