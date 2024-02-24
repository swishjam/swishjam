import Base from "../base";

export class ApiKeys extends Base {
  static async workspaceForPublicKey(public_key) {
    return await this._get(`/api/v1/admin/api_keys/workspace_for_api_key/${public_key}`)
  }
}

Object.assign(ApiKeys, Base);
export default ApiKeys;