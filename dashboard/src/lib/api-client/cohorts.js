import Base from "./base";

export class Cohorts extends Base {
  static async create({ name, description, queryFilterGroups }) {
    return await this._post('/api/v1/cohorts', { name, description, query_filter_groups: queryFilterGroups })
  }

  static async update(id, { name, description, queryFilterGroups }) {
    return await this._patch(`/api/v1/cohorts/${id}`, { name, description, query_filter_groups: queryFilterGroups })
  }

  static async list({ type, page, perPage } = {}) {
    return await this._get('/api/v1/cohorts', { type, page, perPage })
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/cohorts/${id}`)
  }

  static async delete(id) {
    return await this._delete(`/api/v1/cohorts/${id}`)
  }

  static async preview({ queryFilterGroups, page, limit }) {
    return await this._patch('/api/v1/cohorts/preview', { query_filter_groups: queryFilterGroups, page, limit })
  }

  static async sql(id) {
    return await this._get(`/api/v1/cohorts/${id}/sql`)
  }
}

Object.assign(Cohorts, Base);
export default Cohorts;