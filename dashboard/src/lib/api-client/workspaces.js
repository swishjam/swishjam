import Base from "./base";

export class Workspaces extends Base {
  static async list() {
    return await this._get('/api/v1/workspaces')
  }

  static async create({ name, url }) {
    return await this._post('/api/v1/workspaces', { workspace: { name, company_url: url } })
  }
}

Object.assign(Workspaces, Base);
export default Workspaces;