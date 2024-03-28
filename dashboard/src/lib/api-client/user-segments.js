import Base from "./base";

export class UserSegments extends Base {
  static async create({ name, description, queryFilterGroups }) {
    return await this._post('/api/v1/user_segments', { name, description, query_filter_groups: queryFilterGroups })
  }

  static async update(id, { name, description, queryFilterGroups }) {
    return await this._patch(`/api/v1/user_segments/${id}`, { name, description, query_filter_groups: queryFilterGroups })
  }

  static async list({ page, perPage } = {}) {
    return await this._get('/api/v1/user_segments', { page, perPage })
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/user_segments/${id}`)
  }

  static async delete(id) {
    return await this._delete(`/api/v1/user_segments/${id}`)
  }

  static async preview({ queryFilterGroups, page, limit }) {
    return await this._patch('/api/v1/user_segments/preview', { query_filter_groups: queryFilterGroups, page, limit })
  }

  static async sql(id) {
    return await this._get(`/api/v1/user_segments/${id}/sql`)
  }
}

Object.assign(UserSegments, Base);
export default UserSegments;