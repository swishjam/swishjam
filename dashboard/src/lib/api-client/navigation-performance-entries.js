import { API } from './base';

export class NavigationPerformanceEntriesApi extends API {
  static async getAverages(data) {
    const { records } = await API.get('/api/navigation-performance-entries/average', data);
    return records[0];
  }
}