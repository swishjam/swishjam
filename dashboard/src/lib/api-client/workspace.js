import Base from "./base";

export class Workspace extends Base {
  static async update({ name }) {
    return await this._patch('/api/v1/workspace/update', { workspace: { name: name } });
  }
}

Object.assign(Workspace, Base);
export default Workspace;