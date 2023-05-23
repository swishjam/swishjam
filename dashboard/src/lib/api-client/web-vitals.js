import { API } from './base';
import { monthByNumber } from '../utils';
import { filledInTimeseries } from '@lib/utilities/timeseriesHelpers';

const formattedDate = isoDate => {
  const splitDate = isoDate.split('T')[0].split('-');
  // return `${monthByNumber[parseInt(splitDate[1])]}, ${numberWithOrdinalIndicator(parseInt(splitDate[2]))}`
  return [splitDate[1], splitDate[2]].join('/');
}

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

  static async getHistogramData(data) {
    return await API.get(`/api/cwv/histogram`, data);
  }

  static async getGoodNeedsImprovementChartData(data) {
    const { results, groupedBy } = await API.get('/api/cwv/good-needs-improvement-bad', data);
    let formattedResults = {};
    Object.keys(results).forEach(metricKey => {
      formattedResults[metricKey] = filledInTimeseries({ timeseries: results[metricKey], groupedBy }).map(({ 
        date, 
        total_num_records = 0,
        num_good_records = 0, 
        num_needs_improvement_records = 0, 
        num_bad_records = 0 
      }) => ({
        fullDate: date,
        date: groupedBy === 'day' 
                ? formattedDate(date) 
                : groupedBy === 'week' 
                  ? `Week of ${formattedDate(date)}`
                  : `Month of ${monthByNumber[parseInt(formattedDate(date).split('/')[0])]}`,
        total: parseInt(total_num_records),
        numGood: parseInt(num_good_records),
        percentGood: (parseInt(num_good_records) / parseInt(total_num_records)) * 100,
        numNeedsImprovement: parseInt(num_needs_improvement_records),
        percentNeedsImprovement: (parseInt(num_needs_improvement_records) / parseInt(total_num_records)) * 100,
        numPoor: parseInt(num_bad_records),
        percentPoor: (parseInt(num_bad_records) / parseInt(total_num_records)) * 100,
        noData: parseInt(total_num_records) === 0 ? 100 : 0,
      }));
    });
    return { data: formattedResults, groupedBy };
  }

  static async getTimeseriesData(params) {
    const { results } = await API.get('/api/cwv/timeseries', params);
    let formattedResults = {};
    const groupedBy = params.groupBy || 'day';
    Object.keys(results).forEach(metricKey => {
      formattedResults[metricKey] = results[metricKey].map(datapoint => ({
        date: groupedBy === 'day' 
                ? formattedDate(datapoint.date, { includeTime: false })
                : groupedBy === 'week'
                  ? `Week of ${formattedDate(datapoint.date, { includeTime: false })}`
                  : `Month of ${monthByNumber[parseInt(formattedDate(datapoint.date, { includeTime: false }).split('/')[0])]}`,
        value: parseFloat(datapoint.value),
      }));
    });
    return formattedResults;
  }
}