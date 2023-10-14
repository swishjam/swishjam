import Base from "./base";

export class Workspace extends Base {
  static async update({ name }) {
    return await this._patch('/api/v1/workspace/update', { workspace: { name: name } });
  }

  static async updateCurrentWorkspace(workspaceId) {
    return await this._patch(`/api/v1/workspace/update_current_workspace/${workspaceId}`)
  }
}

Object.assign(Workspace, Base);
export default Workspace;