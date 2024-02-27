import Base from "./base";

export class Automations extends Base {
  static async list({ page, limit } = {}) {
    return await this._get('/api/v1/automations', { page, limit });
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/automations/${id}`);
  }
}

Object.assign(Automations, Base);
export default Automations;