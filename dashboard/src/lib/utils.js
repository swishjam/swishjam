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

export const formattedDate = dateString => {
  const d = new Date(dateString);
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

export const bytesToHumanFileSize = (bytes, decimals = 2) => {
  const thresh = 1024;

  if (Math.abs(bytes) < thresh) return bytes + ' B';

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  const r = 10 ** decimals;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(decimals) + ' ' + units[u];
}