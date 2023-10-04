import Base from "./base";

export class Integrations extends Base {
  static async list() {
    return await this._get('/api/v1/integrations')
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