import Base from "./base";

export class WorkspaceSettings extends Base {
  static async update({ use_marketing_data_source_in_lieu_of_product, use_product_data_source_in_lieu_of_marketing }) {
    return await this._patch('/api/v1/workspace_settings', { use_marketing_data_source_in_lieu_of_product, use_product_data_source_in_lieu_of_marketing })
  }
}

Object.assign(WorkspaceSettings, Base);
export default WorkspaceSettings;