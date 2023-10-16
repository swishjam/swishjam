import Base from "./base";

export class WorkspaceSettings extends Base {
  static async update({ combine_marketing_and_product_data_sources, should_enrich_user_profile_data }) {
    return await this._patch('/api/v1/workspace_settings', { combine_marketing_and_product_data_sources, should_enrich_user_profile_data })
  }
}

Object.assign(WorkspaceSettings, Base);
export default WorkspaceSettings;