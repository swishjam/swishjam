import { API } from './base';

export class PageViewsAPI extends API {
  static async getCount(data) {
    const { count } = await API.get(`/api/page-views/count`, data);
    return parseInt(count);
  }
}