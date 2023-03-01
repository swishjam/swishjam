const get = async (url, payload) => {
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
    const formatted = data.results.map(result => {
      return {
        timestamp: `${new Date(result.hour).getMonth() + 1}/${new Date(result.hour).getDate()} ${new Date(result.hour).getHours()}:00`,
        Good: parseFloat(result.percent_good_records),
        "Needs Improvement": parseFloat(result.percent_medium_records),
        Poor: parseFloat(result.percent_bad_records)
      }
    });
    return formatted;
  } catch (e) {
    console.error(e.message)
  }
}

export const GetNavigationPerformanceEntriesData = async data => {
  return await get('/api/navigationResources/average', data);
}