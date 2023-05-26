import { API } from './base';

export class ProjectReportUrlsAPI extends API {
  static async getAll() {
    let data = await API.get('/api/project-report-urls/all');
    return data; 
  }

  static async getUniqueHosts() {
    const allUrlConfigs = await API.get('/api/project-report-urls/all');
    return allUrlConfigs
            .filter((urlConfig, index, self) => self.findIndex(t => t.url_host === urlConfig.url_host) === index)
            .map(urlConfig => urlConfig.url_host)
            .sort((a, b) => a.localeCompare(b));
  }

  static async getUniquePaths({ urlHost }) {
    const allUrlConfigs = await API.get('/api/project-report-urls/all');
    return allUrlConfigs
            .filter(urlConfig => urlConfig.url_host === urlHost)
            .map(urlConfig => urlConfig)
            .filter((urlPath, index, self) => self.findIndex(t => t === urlPath) === index)
            .sort((a, b) => a.url_path.localeCompare(b.url_path));
  }

  static async create({ url, cadence, dataType, enabled }) {
    console.log({ url, cadence, dataType, enabled }); 
    return await API.post('/api/project-report-urls/create', { url, dataType, cadence, enabled });
  }

  static async update({ id, url, cadence, dataType, enabled }) {
    return await API.post('/api/project-report-urls/update', { id, url, dataType, cadence, enabled });
  }
}