import Base from "./base";

export class Workspace extends Base {
  static async update({ name, shouldEnrichUserProfileData }) {
    return await this._patch('/api/v1/workspace/update', { workspace: { name, should_enrich_user_profile_data: shouldEnrichUserProfileData } });
  }

  static async updateCurrentWorkspace(workspaceId) {
    return await this._patch(`/api/v1/workspace/update_current_workspace/${workspaceId}`)
  }
}

Object.assign(Workspace, Base);
export default Workspace;