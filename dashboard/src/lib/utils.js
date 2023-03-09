export const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const fetcher = (url) => fetch(url).then((res) => res.json());

export const msToSeconds = (ms) => (ms / 1000).toFixed(2);

export const formattedDate = dateString => {
  const d = new Date(dateString);
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

export const calcCwvPercent = (val, good, medium) => {
  const smallestGap = Math.min(good, medium - good);   
  const total = medium + smallestGap;

  return {
   percent: Math.min(val/total * 100, 99),
   bounds: [ (good/total*100), ((medium-good)/total*100), (smallestGap/total*100) ]
  }
}

export const cwvMetricBounds = {
  FCP: { good: 1_800, medium: 3_000 },
  LCP: { good: 2_500, medium: 4_000, },
  CLS: { good: 0.1, medium: 0.25 },
  FID: { good: 100, medium: 300 },
  TTFB: { good: 800, medium: 1_800 },
  INP: { good: 200, medium: 500 }
};

export const bytesToHumanFileSize = (bytes, decimals = 2) => {
  const thresh = 1024;

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
    case 'img':
      return 'Image';
    case 'script':
      return 'Script';
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