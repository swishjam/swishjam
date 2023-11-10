import Base from "../base";

export class Ingestion extends Base {
  static async queueing() {
    return await this._get('/api/v1/admin/ingestion/queuing')
  }

  static async queueStats() {
    return await this._get('/api/v1/admin/ingestion/queue_stats')
  }

  static async eventCounts() {
    return await this._get('/api/v1/admin/ingestion/event_counts')
  }

  static async ingestionBatches() {
    return await this._get('/api/v1/admin/ingestion/ingestion_batches')
  }
}

Object.assign(Ingestion, Base);
export default Ingestion;