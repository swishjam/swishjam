export const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const fetcher = (url) => fetch(url).then((res) => res.json());

const msToSeconds = (ms) => (ms / 1000).toFixed(2);

const metricFormatter = (value, metricUnits) => {
  if (metricUnits === 's') {
    return `${msToSeconds(value)} s`;
  } else  if (metricUnits === 'ms') {
    return `${value} ms`; 
  } else {
    try {
      return parseFloat(value).toFixed(4);
    } catch(err) {
      return value;
    }
  }
};

const metricFormatterPlusUnits = (value, metricUnits) => (metricFormatter(value, metricUnits)+metricUnits);

export {
  metricFormatter, 
  metricFormatterPlusUnits,
  msToSeconds,
}

export const formattedMsOrSeconds = ms => parseFloat(ms) > 999 ? `${msToSeconds(parseFloat(ms))} s` : `${parseFloat(ms).toFixed(0)} ms`;

export const formattedDate = dateString => {
  const d = new Date(dateString);
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

export const bytesToHumanFileSize = (bytes, decimals = 2) => {
  const thresh = 1_000;

  if (Math.abs(bytes) < thresh) return Math.round(Math.abs(bytes)) + ' B';

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  const r = 10 ** decimals;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(decimals) + ' ' + units[u];
}

export const calculatedResourceTimings = resourceTimings => {
  return {
    waiting: resourceTimings.domain_lookup_start ? resourceTimings.domain_lookup_start - resourceTimings.start_time : 0,
    dns: resourceTimings.domain_lookup_end ? resourceTimings.domain_lookup_end - resourceTimings.domain_lookup_start : 0,
    tcp: resourceTimings.secure_connection_start ? resourceTimings.secure_connection_start - resourceTimings.connect_start : 0,
    tls: resourceTimings.secure_connection_start ? resourceTimings.connect_end - resourceTimings.secure_connection_start : 0,
    ssl: resourceTimings.secure_connection_start ? resourceTimings.request_start - resourceTimings.secure_connection_start : 0,
    request: resourceTimings.request_start ? resourceTimings.response_start - resourceTimings.request_start : 0,
    response: resourceTimings.response_start ? resourceTimings.response_end - resourceTimings.response_start : 0,
    entire: resourceTimings.response_end - resourceTimings.start_time,
    
    redirect: resourceTimings.redirect_end - resourceTimings.redirect_start,
    fetch: resourceTimings.response_end - resourceTimings.fetch_start,
    serviceWorker: resourceTimings.fetch_start - resourceTimings.worker_start,
    wasCompressed: resourceTimings.encoded_body_size !== resourceTimings.decoded_body_size,
    wasLocallyCached: resourceTimings.transfer_size === 0,
  }
}

export const resourceTypeToHumanName = initiatorType => {
  switch (initiatorType) {
    case 'navigation':
      return 'Navigation';
    case 'img':
      return 'Image';
    case 'script':
      return 'JavaScript';
    case 'link':
      return 'Stylesheet';
    case 'font':
      return 'Font';
    case 'media':
      return 'Media';
    case 'xmlhttprequest':
      return 'XHR';
    case 'fetch':
      return 'Fetch';
    case 'beacon':
      return 'Beacon';
    case 'document':
      return 'Document';
    case 'other':
      return 'Other';
    default:
      return initiatorType;
  }
}