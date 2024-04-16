import Base from "./base";

export class Workspaces extends Base {
  static async list() {
    return await this._get('/api/v1/workspaces')
  }
}

Object.assign(Workspaces, Base);
export default Workspaces;