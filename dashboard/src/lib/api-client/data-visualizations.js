import Base from "./base";

class DataVizualizations extends Base {
  static async list(dashboardId) {
    return await this._get('/api/v1/data_visualizations', { dashboard_id: dashboardId })
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/data_visualizations/${id}`);
  }

  static async create(payload) {
    return await this._post('/api/v1/data_visualizations', payload);
  }

  static async update(id, payload) {
    return await this._patch(`/api/v1/data_visualizations/${id}`, payload);
  }

  static async delete(id) {
    return await this._delete(`/api/v1/data_visualizations/${id}`);
  }
}

Object.assign(DataVizualizations, Base);
export default DataVizualizations;