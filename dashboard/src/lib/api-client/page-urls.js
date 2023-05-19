import { API } from './base';

export class PageUrlsApi extends API {
  static async getUniqueHosts() {
    const { results } = await API.get('/api/pages/hosts');
    return results.map(result => result.url_host);
  }

  static async getUniquePaths({ urlHosts, urlHost }) {
    if(urlHost) urlHosts = [urlHost];
    const { results } = await API.get('/api/pages/paths', { urlHosts: JSON.stringify(urlHosts) })
    return results;
    // return results.map(result => result.url_path);
  }
}