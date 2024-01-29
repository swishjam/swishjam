import Base from "./base";

export class Reports extends Base {
  static async list() {
    return await this._get('/api/v1/reports')
  }

  static async create({ name, cadence, sending_mechanism, config}) {
    return await this._post('/api/v1/reports', {
      name: name,
      cadence: cadence,
      sending_mechanism: sending_mechanism,
      config: config
    });
  }
  
  static async update(id, { name, cadence, sending_mechanism, config}) {
    return await this._patch(`/api/v1/reports/${id}`, {
      name: name,
      cadence: cadence,
      sending_mechanism: sending_mechanism,
      config: config
    });
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/reports/${id}`);
  }

  static async delete(id) {
    return await this._delete(`/api/v1/reports/${id}`);
  }

  static async disable(id) {
    return await this._patch(`/api/v1/reports/${id}/disable`);
  }

  static async enable(id) {
    return await this._patch(`/api/v1/reports/${id}/enable`);
  }
}

Object.assign(Reports, Base);
export default Reports;