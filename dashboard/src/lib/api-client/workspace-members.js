import Base from "./base";

export class WorkspaceMembers extends Base {
  static async delete(id) {
    return await this._delete(`/api/v1/workspace_members/${id}`);
  }
}

Object.assign(WorkspaceMembers, Base);
export default WorkspaceMembers;