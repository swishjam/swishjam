import Base from "../base";

export class Queues extends Base {
  static async retrieve(name, { page = 1, limit = 100 } = {}) {
    return await this._get(`/api/v1/admin/queues/${name}`, { page, limit });
  }

  static async retryRecord(queueName, recordJson) {
    return await this._post(`/api/v1/admin/queues/${queueName}/records/retry`, { record: recordJson });
  }

  static async retryAllRecordsInQueue(queueName) {
    return await this._post(`/api/v1/admin/queues/${queueName}/records/retry?ALL_RECORDS=true`);
  }

  static async removeRecordFromQueue(queueName, recordJson) {
    return await this._delete(`/api/v1/admin/queues/${queueName}/records/delete`, { record: recordJson });
  }

  static async flushEntireQueue(queueName) {
    return await this._delete(`/api/v1/admin/queues/${queueName}/records/delete?ALL_RECORDS=true`);
  }
}

Object.assign(Queues, Base);
export default Queues;