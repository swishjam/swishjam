import Base from "./base";

export class Integrations extends Base {
  static async create({ type, config, enabled, returnPrivateKey = false }) {
    return await this._post('/api/v1/integrations', { type, config, enabled, return_private_key: returnPrivateKey });
  }

  static async list({ destinations = null } = {}) {
    return await this._get('/api/v1/integrations', { destinations });
  }

  static async delete(id) {
    return await this._delete(`/api/v1/integrations/${id}`);
  }

  static async enable(id) {
    return await this._patch(`/api/v1/integrations/${id}/enable`);
  }

  static async disable(id) {
    return await this._patch(`/api/v1/integrations/${id}/disable`);
  }
}

Object.assign(Integrations, Base)

export default Integrations;