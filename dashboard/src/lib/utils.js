const msToSeconds = (ms) => (ms / 1000).toFixed(2);

const metricFormatter = (value = 0, metricUnits) => {
  if (metricUnits === 's') {
    return `${msToSeconds(value)}`;
  } else  if (metricUnits === 'ms') {
    return `${value}`; 
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

export const formattedDate = (dateString, opts = {}) => {
  opts.includeTime = typeof opts.includeTime === 'boolean' ? opts.includeTime : true;
  const d = new Date(dateString);
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  if(opts.includeTime) {
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  } else {
    return date;
  }
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
    waiting: typeof resourceTimings.connect_end === 'number' && resourceTimings.connect_end === resourceTimings.fetch_start ? resourceTimings.request_start - resourceTimings.connect_end : 
                typeof resourceTimings.domain_lookup_end === 'number' ? resourceTimings.domain_lookup_start - resourceTimings.fetch_start : 0,

    // waiting: typeof resourceTimings.domain_lookup_start === 'number' ? resourceTimings.domain_lookup_start - resourceTimings.start_time : 0,
    redirect: typeof resourceTimings.redirect_end === 'number' ? resourceTimings.redirect_end - resourceTimings.redirect_start : 0,
    dns: typeof resourceTimings.domain_lookup_end === 'number' ? resourceTimings.domain_lookup_end - resourceTimings.domain_lookup_start : 0,

    tcp: typeof resourceTimings.secure_connection_start === 'number' ? resourceTimings.secure_connection_start - resourceTimings.connect_start : 0,
    tls: typeof resourceTimings.secure_connection_start === 'number' ? resourceTimings.request_start - resourceTimings.secure_connection_start : 0,

    initialConnection: typeof resourceTimings.connect_end === 'number' ? resourceTimings.connect_end - resourceTimings.connect_start : 0,
    // ssl: resourceTimings.secure_connection_start ? resourceTimings.request_start - resourceTimings.secure_connection_start : 0,

    request: typeof resourceTimings.request_start === 'number' ? resourceTimings.response_start - resourceTimings.request_start : 0,
    response: typeof resourceTimings.response_start === 'number' ? resourceTimings.response_end - resourceTimings.response_start : 0,
    entire: resourceTimings.response_end - resourceTimings.start_time,
    // waiting + redirect + dns + tcp + tls + ssl + request + response;
    // waiting + redirect + dns + initialConnection + request + response;

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