import Base from "../base";

export class IngestionBatches extends Base {
  static async list({ type, page, limit } = {}) {
    return await this._get('/api/v1/admin/ingestion_batches', { type, page, limit });
  }
}

Object.assign(IngestionBatches, Base);
export default IngestionBatches;

