import { API } from './base';

export class ProjectPageUrlsAPI extends API {
  static async getAll() {
    return await API.get('/api/project-page-urls/all');
  }

  static async create({ url, cadence, enabled }) {
    return await API.post('/api/project-page-urls/create', { url, labTestCadence: cadence, labTestsEnabled: enabled });
  }

  static async update({ id, url, cadence, enabled }) {
    return await API.post('/api/project-page-urls/update', { id, url, labTestCadence: cadence, labTestsEnabled: enabled });
  }
}