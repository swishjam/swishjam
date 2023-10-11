import { useEffect, useState } from 'react';
import LineChartWithValue from "../../Components/LineChartWithValue";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function LineChartRenderingEngine({ title, event, property, calculation, timeframe, dataSource, configuration }) {
  const [timeseriesData, setTimeseriesData] = useState();
  const includeComparison = configuration.include_comparison ?? true;
  const includeSettingsDropdown = configuration.include_settings_dropdown ?? true;
  const hideAxis = configuration.hide_axis ?? false;

  useEffect(() => {
    setTimeseriesData();
    // TODO: Endpoint doesn't do anything with property or calculation yet.
    SwishjamAPI.Events.timeseries(event, property, { calculation, timeframe, dataSource, include_comparison: includeComparison }).then(
      ({ timeseries, comparison_timeseries, current_count, comparison_count, comparison_end_time, grouped_by }) => {
        setTimeseriesData({
          value: current_count,
          previousValue: comparison_count,
          previousValueDate: comparison_end_time,
          valueChange: current_count - comparison_count,
          groupedBy: grouped_by,
          timeseries: timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value
          }))
        });
      });
  }, [event, property, calculation, timeframe]);

  return (
    <LineChartWithValue
      includeSettingsDropdown={includeSettingsDropdown}
      includeComparisonData={includeComparison}
      includeCard={false}
      previousValue={timeseriesData?.previousValue}
      previousValueDate={timeseriesData?.previousValueDate}
      showAxis={!hideAxis}
      timeseries={timeseriesData?.timeseries}
      title={title}
      value={timeseriesData?.value}
    />
  )
}