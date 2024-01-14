import { SHORT_MONTHS } from "./timeHelpers";

const formattedUTCMonth = date => {
  const d = new Date(date);
  const month = SHORT_MONTHS[d.getUTCMonth()];
  return month;
}

const formattedUTCMonthAndDay = date => {
  const d = new Date(date);
  const day = d.getUTCDate();
  return `${formattedUTCMonth(date)}, ${day}`
}

const formattedUTCMonthAndDayAndTime = date => {
  const d = new Date(date);
  let hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const period = hour >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'

  // Add leading zero to the minute if necessary
  const minuteFormatted = minute < 10 ? `0${minute}` : minute;
  return `${formattedUTCMonthAndDay(date)} ${hour}:${minuteFormatted} ${period}`
}

const dateFormatterForGrouping = grouping => {
  switch (grouping) {
    case 'month':
    case 'monthly':
      return formattedUTCMonth;
    case 'week':
    case 'weekly':
      return date => `Week of ${formattedUTCMonthAndDay(date)}`
    case 'day':
    case 'daily':
      return formattedUTCMonthAndDay;
    case 'hour':
    case 'minute':
    case 'hourly':
      return formattedUTCMonthAndDayAndTime;
    default:
      return formattedUTCMonthAndDay;
  }
}

const setStateFromTimeseriesResponse = (response, setter, onError) => {
  if (response.timeseries === undefined) {
    onError && onError(response.error);
    return;
  }
  setter({
    value: response.current_count,
    previousValue: response.comparison_count,
    previousValueDate: response.comparison_end_time,
    groupedBy: response.grouped_by,
    timeseries: response.timeseries.map(
      (timeseries, index) => ({
        ...timeseries,
        comparisonDate: response?.comparison_timeseries?.[index]?.date,
        comparisonValue: response?.comparison_timeseries?.[index]?.value,
      }),
    ),
  });
}

const setStateFromMultiDimensionalTimeseriesResponse = (response, setter, onError) => {
  if (response.timeseries === undefined) {
    onError && onError(response.error);
    return;
  }
  debugger;
  setter({
    // value: response.current_count,
    // previousValue: response.comparison_count,
    // previousValueDate: response.comparison_end_time,
    groupedBy: response.grouped_by,
    timeseries: response.timeseries.map(
      (timeseries, index) => ({
        ...timeseries,
        comparison: response.comparison_timeseries?.[index] || {},
      }),
    ),
  });
}

export {
  formattedUTCMonth,
  formattedUTCMonthAndDay,
  formattedUTCMonthAndDayAndTime,
  dateFormatterForGrouping,
  setStateFromTimeseriesResponse,
  setStateFromMultiDimensionalTimeseriesResponse
}