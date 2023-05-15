import { ONE_DAY_IN_MS, startOfDay, dateToUTC } from "./timeHelpers";

const filledInTimeseries = ({ timeseries, groupedBy, expectedNumDataPoints = 5 }) => {
  if (timeseries.length >= expectedNumDataPoints) return timeseries;
  const secondIncrements = groupedBy === 'day' ? ONE_DAY_IN_MS : groupedBy === 'week' ? ONE_DAY_IN_MS * 7 : ONE_DAY_IN_MS * 30;
  const expectedTimes = Array.from({ length: expectedNumDataPoints }, (_, i) => dateToUTC(startOfDay(new Date() - secondIncrements * i)).toISOString());
  expectedTimes.forEach(time => {
    if (!timeseries.find(datapoint => datapoint.date === time)) timeseries.push({ date: time });
  })
  return timeseries;
}

export { filledInTimeseries }