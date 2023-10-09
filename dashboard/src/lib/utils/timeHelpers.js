const ONE_SECOND_IN_MS = 1_000;
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;
const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60;
const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 24;

const ONE_MINUTE_IN_SECONDS = ONE_MINUTE_IN_MS / 1_000;
const ONE_HOUR_IN_SECONDS = ONE_HOUR_IN_MS / 1_000;
const ONE_DAY_IN_SECONDS = ONE_DAY_IN_MS / 1_000;

const intelligentlyFormattedMs = ms => {
  try {
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
  } catch (err) {
    return `${ms} ms`
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