import { API } from './base';

export class LabTestConfigurationsAPI extends API {
  static async getAll() {
    return await API.get('/api/lab-test-configurations/all');
  }

  static async create({ url, cadence }) {
    return await API.post('/api/lab-test-configurations/create', { url, cadence });
  }
}