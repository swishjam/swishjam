import Base from "./base";

export class WorkspaceInvitations extends Base {
  static async create({ email }) {
    return await this._post('/api/v1/workspace_invitations', { email });
  }

  static async retrieve(inviteToken) {
    return await this._get(`/api/v1/workspace_invitations/${inviteToken}`)
  }

  static async accept(inviteToken, options = {}) {
    return await this._post(`/api/v1/workspace_invitations/${inviteToken}/accept`, options);
  }
}

Object.assign(WorkspaceInvitations, Base);
export default WorkspaceInvitations;