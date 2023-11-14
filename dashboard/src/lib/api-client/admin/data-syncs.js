import Base from "../base";

export class DataSyncs extends Base {
  static async list() {
    return await this._get('/api/v1/admin/data_syncs');
  }
}

Object.assign(DataSyncs, Base);
export default DataSyncs;