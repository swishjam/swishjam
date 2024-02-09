const ONE_SECOND_IN_MS = 1_000;
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;
const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60;
const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 24;

const ONE_MINUTE_IN_SECONDS = ONE_MINUTE_IN_MS / 1_000;
const ONE_HOUR_IN_SECONDS = ONE_HOUR_IN_MS / 1_000;
const ONE_DAY_IN_SECONDS = ONE_DAY_IN_MS / 1_000;

const LONG_MONTHS = ['January', "February", 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT_MONTHS = ['Jan', "Feb", 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const prettyDateTime = (date, opts = {}) => {
  const month = opts.month || 'long';
  const day = opts.day || 'numeric';
  const year = opts.year || 'numeric';
  const hour = opts.hour || 'numeric';
  const minute = opts.minute || 'numeric';
  const seconds = opts.seconds || 'none';
  const d = new Date(date);
  return `${d.toLocaleDateString('en-US', { month, day, year })} at ${d.toLocaleTimeString('en-US', { hour, minute, seconds })}`
}

const intelligentlyFormattedMs = ms => {
  try {
    let remainingMs = ms;
    const hours = Math.floor(remainingMs / ONE_HOUR_IN_MS);
    remainingMs %= ONE_HOUR_IN_MS;

    const minutes = Math.floor(remainingMs / ONE_MINUTE_IN_MS);
    remainingMs %= ONE_MINUTE_IN_MS;

    const seconds = Math.floor(remainingMs / ONE_SECOND_IN_MS);
    remainingMs %= ONE_SECOND_IN_MS;

    const milliseconds = remainingMs;

    let result = '';
    if (hours > 0) {
      result += `${hours.toFixed(0)} hour${hours.toFixed(0) > 1 ? 's' : ''}, `;
    }
    if (minutes > 0) {
      result += `${minutes.toFixed(0)} minute${minutes.toFixed(0) > 1 ? 's' : ''}, `;
    }
    if (seconds > 0) {
      result += `${seconds.toFixed(0)} second${seconds.toFixed(0) > 1 ? 's' : ''}, `;
    }
    if (milliseconds > 0) {
      result += `${milliseconds.toFixed(0)} millisecond${milliseconds.toFixed(0) > 1 ? 's' : ''}`;
    }
    if (result.endsWith(', ')) {
      result = result.slice(0, -2);
    }

    return result;
  } catch (err) {
    return `${ms} ms`
  }
}

export {
  prettyDateTime,
  intelligentlyFormattedMs,
  LONG_MONTHS,
  ONE_SECOND_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_HOUR_IN_MS,
  ONE_DAY_IN_MS,
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  SHORT_MONTHS,
}