import Base from "./base";

export class WorkspaceSettings extends Base {
  static async update(settings) {
    return await this._patch('/api/v1/workspace_settings', settings)
  }
}

Object.assign(WorkspaceSettings, Base);
export default WorkspaceSettings;