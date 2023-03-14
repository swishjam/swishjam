import { API } from './base';

export class PerformanceMetricsApi extends API {
  static async getAllAverages(data) {
    const { records } = await API.get('/api/performance-metrics/all-averages', data);
    return records;
  }
}