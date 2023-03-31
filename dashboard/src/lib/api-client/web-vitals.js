import { API } from './base';
import { formattedDate } from '../utils';

export class WebVitalsApi extends API {
  static async average(data) {
    return await API.get('/api/cwv/average', data);
  }

  static async getPercentileForMetrics(data) {
    return await API.get('/api/cwv/percentile', data);
  }

  static async goodNeedsWorkBadChartData(data) {
    const { results } = await API.get('/api/cwv/good-needs-work-bad', data);
    let formattedResults = {};
    Object.keys(results).forEach(metricKey => {
      formattedResults[metricKey] = results[metricKey].map(datapoint => ({
        date: formattedDate(datapoint.date, { includeTime: false }),
        total: parseInt(datapoint.total_num_records),
        numGood: parseInt(datapoint.num_good_records || 0),
        percentGood: (parseInt(datapoint.num_good_records || 0) / parseInt(datapoint.total_num_records)) * 100,
        numNeedsWork: parseInt(datapoint.num_needs_work_records || 0),
        percentNeedsWork: (parseInt(datapoint.num_needs_work_records || 0) / parseInt(datapoint.total_num_records)) * 100,
        numBad: parseInt(datapoint.num_bad_records || 0),
        percentBad: (parseInt(datapoint.num_bad_records || 0) / parseInt(datapoint.total_num_records)) * 100,
      }));
    });
    return formattedResults;
  }

  static async timeseries(params) {
    const { results } = await API.get('/api/cwv/timeseries', params);
    return results.map(result => {
      return {
        timestamp: formattedDate(result.hour),
        p75: parseFloat(result.percentile_result || 0),
      }
    });
  }
}