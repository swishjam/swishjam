import Base from "../base";

export class Users extends Base {
  static async list(orgId) {
    return await this._get(`/api/v1/organizations/${orgId}/users`)
  }
}

Object.assign(Users, Base);
export default Users;