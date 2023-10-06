import Base from "../base";

export class Ingestion extends Base {
  static async queueing() {
    return await this._get('/api/v1/admin/ingestion/queuing')
  }
}

Object.assign(Ingestion, Base);
export default Ingestion;