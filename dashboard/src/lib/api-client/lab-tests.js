import { API } from './base';

export class LabTestsAPI extends API {
  static async initiate({ url }) {
    return await API.get('/api/lab-tests/run', { url });
  }

  static async getAll(data) {
    return await API.get('/api/lab-tests/all', data);
  }

  static async getUniqueHosts() {
    return await API.get('/api/lab-tests/unique-hosts');
  }

  static async getUniquePaths({ urlHost }) {
    return await API.get('/api/lab-tests/unique-paths', { urlHost });
  }
}