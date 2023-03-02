const get = async (url, payload = {}) => {
  try {
    const queryParams = new URLSearchParams(payload);
    return await (await fetch(`${url}?${queryParams}`, {})).json();
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

export const GetCWVData = async data => {
  return await get('/api/cwv/average', data);
}

export const GetCWVTimeSeriesData = async params => {
  try {
    const data = await get('/api/cwv/timeseries', params);
    return data.results.map(result => {
      return {
        timestamp: `${new Date(result.hour).getMonth() + 1}/${new Date(result.hour).getDate()} ${new Date(result.hour).getHours()}:00`,
        p90: parseFloat(result.percentile_result || 0),
      }
    });
  } catch (e) {
    console.error(e.message)
  }
}

export const GetNavigationPerformanceEntriesData = async data => {
  return await get('/api/navigationResources/average', data);
}

export const GetResourcesForUrlPath = async data => {
  return await get(`/api/resourcePerformanceEntries/byUrlPath`, data);
}

export const GetPagesForCWVMetric = async data => {
  return await get('/api/cwv/pages', data);
}

export const GetResourceMetricTimeseries = async data => {
  const results = await get('/api/resourcePerformanceEntries/timeseries', data);
  return results.records.map(result => {
    return {
      timestamp: `${new Date(result.hour).getMonth() + 1}/${new Date(result.hour).getDate()} ${new Date(result.hour).getHours()}:00`,
      metric: parseFloat(result.metric || 0),
    }
  });
}