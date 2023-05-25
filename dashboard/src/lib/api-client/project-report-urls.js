import { API } from './base';

export class ProjectReportUrlsAPI extends API {
  static async getAll() {
    let data = await API.get('/api/project-report-urls/all');
    return [
      {
        "id":"473b84eb-4f08-426d-8848-1ea0b8e94230",
        "project_id":"0cf38732-3ea1-45d6-be37-72675b0f1c1c",
        "created_at":"2023-04-27T17:40:31.197215+00:00",
        "full_url":"https://swishjam.com/pricing",
        "url_host":"swishjam.com",
        "url_path":"/pricing",
        "data_source":"rum",
        "cadence":"7-day",
        "enabled":true,
        "url_uniqueness_key":null
      }
    ]
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

  static async create({ url, cadence, dataSource, enabled }) {
    return await API.post('/api/project-report-urls/create', { url, dataSource, cadence, enabled });
  }

  static async update({ id, url, cadence, dataSource, enabled }) {
    return await API.post('/api/project-report-urls/update', { id, url, dataSource, cadence, enabled });
  }
}