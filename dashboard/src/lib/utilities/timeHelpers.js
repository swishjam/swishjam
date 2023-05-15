const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const ONE_DAY_IN_MS = ONE_DAY_IN_SECONDS * 1000;

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

export { 
  ONE_DAY_IN_SECONDS, 
  ONE_DAY_IN_MS,
  dateToUTC,
  startOfDay, 
}