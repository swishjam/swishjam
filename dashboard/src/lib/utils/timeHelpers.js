const ONE_SECOND_IN_MS = 1_000;
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;
const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60;
const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 24;

const ONE_MINUTE_IN_SECONDS = ONE_MINUTE_IN_MS / 1_000;
const ONE_HOUR_IN_SECONDS = ONE_HOUR_IN_MS / 1_000;
const ONE_DAY_IN_SECONDS = ONE_DAY_IN_MS / 1_000;

const startOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const dateToUTC = date => {
  const d = new Date(date);
  d.setUTCFullYear(d.getFullYear());
  d.setUTCMonth(d.getMonth());
  d.setUTCDate(d.getDate());
  d.setUTCHours(d.getHours());
  d.setUTCMinutes(d.getMinutes());
  d.setUTCSeconds(d.getSeconds());
  return d;
}

const intelligentlyFormattedMs = ms => {
  if (ms < ONE_SECOND_IN_MS) {
    return `${ms.toLocaleString('en-US')} ms`;
  } else if (ms < ONE_MINUTE_IN_MS) {
    return `${(ms / ONE_SECOND_IN_MS).toLocaleString('en_US')} s`
  } else if (ms < ONE_HOUR_IN_MS) {
    return `${(ms / ONE_MINUTE_IN_MS).toLocaleString('en-US')} mins`
  } else if (ms < ONE_DAY_IN_MS) {
    return `${(ms / ONE_HOUR_IN_MS).toLocaleString('en-US')} hours`
  } else {
    return `${(ms / ONE_DAY_IN_MS).toLocaleString('en-US')} days`
  }
}

export {
  ONE_SECOND_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_HOUR_IN_MS,
  ONE_DAY_IN_MS,
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  dateToUTC,
  startOfDay,
  intelligentlyFormattedMs,
}