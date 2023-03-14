export const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const fetcher = (url) => fetch(url).then((res) => res.json());

const msToSeconds = (ms) => (ms / 1000).toFixed(2);

const metricFormatter = (value, metricUnits) => {
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

export const formattedMsOrSeconds = ms => parseFloat(ms) > 999 ? `${msToSeconds(parseFloat(ms))} s` : `${parseFloat(ms).toFixed(2)} ms`;

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