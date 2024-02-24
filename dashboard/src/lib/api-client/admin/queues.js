import Base from "../base";

export class Queues extends Base {
  static async retrieve(name, { page = 1, limit = 100 } = {}) {
    return await this._get(`/api/v1/admin/queues/${name}`, { page, limit });
  }
}

Object.assign(Queues, Base);
export default Queues;