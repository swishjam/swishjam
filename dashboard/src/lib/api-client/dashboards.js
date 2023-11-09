import Base from "./base";

export class Dashboards extends Base {
  static async list({ page = 1, limit = 20 } = {}) {
    return await this._get('/api/v1/dashboards', { page, limit })
  }

  static async create({ name }) {
    return await this._post('/api/v1/dashboards', { dashboard: { name } })
  }

  static async update(id, { name }) {
    return await this._patch(`/api/v1/dashboards/${id}`, { dashboard: { name } })
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/dashboards/${id}`)
  }
}

Object.assign(Dashboards, Base);
export default Dashboards;