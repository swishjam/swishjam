import { formattedDate } from "./utils";

const params = data => {
  const currentProject = localStorage.getItem('currentProject')
  if (currentProject) {
    const { public_id: projectKey } = JSON.parse(currentProject);
    if (!projectKey) throw new Error('No current project key found');
    return { projectKey, ...data };
  } else {
    throw new Error('No current project found');
  }
}

const get = async (url, payload = {}) => {
  try {
    const queryParams = new URLSearchParams(params(payload));
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
        timestamp: formattedDate(result.hour),
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

export const GetResourcePerformanceEntries = async data => {
  return await get(`/api/resources`, data);
}

export const GetPagesForCWVMetric = async data => {
  return await get('/api/cwv/pages', data);
}

export const GetResourceMetricTimeseries = async data => {
  const results = await get('/api/resources/timeseries', data);
  return results.records.map(result => {
    return {
      timestamp: formattedDate(result.hour),
      metric: parseFloat(result.metric || 0),
    }
  });
}

export const GetUrlsForCurrentProject = async data => {
  return (await get('/api/pages/forProject', data)).urls;
}

export const GetUrlHostsForCurrentProject = async () => {
  return (await get('/api/pages/hosts')).results.map(result => result.url_host);
}

export const GetUrlPathsForCurrentProject = async (urlHosts = []) => {
  return (await get('/api/pages/paths', { urlHosts: JSON.stringify(urlHosts) })).results.map(result => result.url_path);
}