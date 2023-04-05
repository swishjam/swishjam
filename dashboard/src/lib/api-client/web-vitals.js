import { API } from './base';
import { formattedDate } from '../utils';

export class WebVitalsApi extends API {
  static async average(data) {
    return await API.get('/api/cwv/average', data);
  }

  static async getPercentileForMetrics(data) {
    return await API.get('/api/cwv/percentile', data);
  }

  static async getMetricsByDeviceType(data) {
    return await API.get('/api/cwv/by-device', data);
  }

  static async getMetricsByConnectionType(data) {
    return await API.get('/api/cwv/by-connection-type', data);
  }

  static async getMetricsByBrowser(data) {
    return await API.get('/api/cwv/by-browser', data);
  }

  static async getGoodNeedsImprovementChartData(data) {
    const { results } = await API.get('/api/cwv/good-needs-improvement-bad', data);
    let formattedResults = {};
    Object.keys(results).forEach(metricKey => {
      formattedResults[metricKey] = results[metricKey].map(datapoint => ({
        date: formattedDate(datapoint.date, { includeTime: false }),
        total: parseInt(datapoint.total_num_records),
        numGood: parseInt(datapoint.num_good_records || 0),
        percentGood: (parseInt(datapoint.num_good_records || 0) / parseInt(datapoint.total_num_records)) * 100,
        numNeedsImprovement: parseInt(datapoint.num_needs_improvement_records || 0),
        percentNeedsImprovement: (parseInt(datapoint.num_needs_improvement_records || 0) / parseInt(datapoint.total_num_records)) * 100,
        numBad: parseInt(datapoint.num_bad_records || 0),
        percentBad: (parseInt(datapoint.num_bad_records || 0) / parseInt(datapoint.total_num_records)) * 100,
      }));
    });
    return formattedResults;
  }

  static async getTimeseriesData(params) {
    const { results } = await API.get('/api/cwv/timeseries', params);
    let formattedResults = {};
    Object.keys(results).forEach(metricKey => {
      formattedResults[metricKey] = results[metricKey].map(datapoint => ({
        date: formattedDate(datapoint.date, { includeTime: false }),
        value: parseFloat(datapoint.value),
      }));
    });
    return formattedResults;
  }
}