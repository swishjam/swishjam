import { API } from './base';

export class LargestContentfulPaintEntriesApi extends API {
  static async getDistinctEntries(data) {
    const { records } = await API.get('/api/largest-contentful-paint-entries/distinct', data);
    return records;
  }
}