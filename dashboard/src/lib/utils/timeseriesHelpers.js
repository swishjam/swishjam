import { ONE_DAY_IN_MS, startOfDay, dateToUTC } from "./timeHelpers";

const filledInTimeseries = ({ timeseries, groupedBy, expectedNumDataPoints = 5 }) => {
  if (timeseries.length >= expectedNumDataPoints) return timeseries;
  const secondIncrements = groupedBy === 'day' ? ONE_DAY_IN_MS : groupedBy === 'week' ? ONE_DAY_IN_MS * 7 : ONE_DAY_IN_MS * 30;
  const expectedTimes = Array.from({ length: expectedNumDataPoints }, (_, i) => dateToUTC(startOfDay(new Date() - secondIncrements * i)).toISOString());
  expectedTimes.forEach(time => {
    if (!timeseries.find(datapoint => datapoint.date === time)) timeseries.push({ date: time });
  })
  return timeseries.sort((a, b) => new Date(a.date) - new Date(b.date));
}

const dateFormatterForGrouping = grouping => {
  switch(grouping) {
    case 'month':
      return date => new Date(date).toLocaleString("default", { month: "long" });
    case 'week':
      return date => `Week of ${new Date(date).toLocaleString("default", { day: "numeric", month: "short" })}`;
    case 'day':
      return date => new Date(date).toLocaleString("default", { day: "numeric", month: "short" });
    case 'hour':
      return date => new Date(date).toLocaleString("default", { hour: "numeric", minute: "numeric", day: 'numeric', month: 'short' });
    default:
      return date => new Date(date).toLocaleString("default", { day: "numeric", month: "short" });
  }
}

export { filledInTimeseries, dateFormatterForGrouping }