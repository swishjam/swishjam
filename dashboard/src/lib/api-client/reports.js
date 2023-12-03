import Base from "./base";

export class Reports extends Base {
  static async list() {
    return await this._get('/api/v1/reports')
  }

  static async create({ eventName, steps }) {
    return await this._post('/api/v1/reports', { event_name: eventName, event_trigger_steps: steps });
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