import { API } from './base';

export class SpeedTestAPI extends API {
  static async initiate({ url }) {
    return await API.get('/api/speed-test', { url });
  }
}