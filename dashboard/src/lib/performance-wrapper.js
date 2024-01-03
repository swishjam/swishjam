export const withPerformanceMeasurement = async (measurementName, fn) => {
  window.performance.mark(`${measurementName}-start`);
  debugger;
  const result = await fn();
  debugger;
  window.performance.mark(`${measurementName}-end`);
  window.performance.measure(measurementName, `${measurementName}-start`, `${measurementName}-end`);
  return result;
}

export default withPerformanceMeasurement;