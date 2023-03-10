import { API } from './base';
import { formattedDate } from '../utils';

export class WebVitalsApi extends API {
  static async average(data) {
    return await API.get('/api/cwv/average', data);
  }

  static async timeseries(params) {
    const { results } = await API.get('/api/cwv/timeseries', params);
    return results.map(result => {
      return {
        timestamp: formattedDate(result.hour),
        p90: parseFloat(result.percentile_result || 0),
      }
    });
  }
}