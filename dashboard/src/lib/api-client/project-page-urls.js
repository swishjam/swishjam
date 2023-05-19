import { API } from './base';

export class ProjectPageUrlsAPI extends API {
  static async getAll() {
    return await API.get('/api/project-page-urls/all');
  }

  static async getUniqueHosts() {
    const allUrlConfigs = await API.get('/api/project-page-urls/all');
    return allUrlConfigs
            .filter((urlConfig, index, self) => self.findIndex(t => t.url_host === urlConfig.url_host) === index)
            .map(urlConfig => urlConfig.url_host)
            .sort((a, b) => a.localeCompare(b));
  }

  static async getUniquePaths({ urlHost }) {
    const allUrlConfigs = await API.get('/api/project-page-urls/all');
    return allUrlConfigs
            .filter(urlConfig => urlConfig.url_host === urlHost)
            .map(urlConfig => urlConfig)
            .filter((urlPath, index, self) => self.findIndex(t => t === urlPath) === index)
            .sort((a, b) => a.localeCompare(b));
  }

  static async create({ url, cadence, enabled }) {
    const params = { url, labTestCadence: cadence, labTestsEnabled: enabled };
    if (!cadence) delete params.labTestCadence;
    return await API.post('/api/project-page-urls/create', params);
  }

  static async update({ id, url, cadence, enabled }) {
    return await API.post('/api/project-page-urls/update', { id, url, labTestCadence: cadence, labTestsEnabled: enabled });
  }
}