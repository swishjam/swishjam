import { API } from './base';

export class ResourcePerformanceEntriesApi extends API {
  static async getAll(data) {
    const { records } = await API.get('/api/resource-performance-entries', data);
    return records;
  }
}