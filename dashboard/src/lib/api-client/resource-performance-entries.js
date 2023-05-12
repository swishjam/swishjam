import { API } from './base';

export class ResourcePerformanceEntriesApi extends API {
  static async getTimeseriesData(data) {
    const encodedUrl = encodeURIComponent(data.url);
    return await API.get(`/api/resource-performance-entries/${encodedUrl}/timeseries`, data);
  }

  static async getMetricsData(data) {
    const encodedUrl = encodeURIComponent(data.url);
    return await API.get(`/api/resource-performance-entries/${encodedUrl}/metrics`, data);
  }

  static async getAll(data) {
    const { records } = await API.get('/api/resource-performance-entries/all', data);
    return records;
  }

  static async getXHRResources(data) {
    return await API.get('/api/resource-performance-entries/xhrs', data);
  }
}