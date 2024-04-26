import { useEffect, useState } from 'react';
import LineChartWithValue from "../../Components/AreaChartWithValue";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function AreaChartRenderingEngine({
  title,
  subtitle,
  event,
  property,
  aggregation,
  dataSource,
  timeframe,
  whereClauseGroups = [],
  ...settings
}) {
  const [timeseriesData, setTimeseriesData] = useState();
  const include_comparison = settings.includeComparison ?? settings.include_comparison ?? true;
  const valueFormatter = settings.value_formatter ?? settings.valueFormatter ?? 'number';

  useEffect(() => {
    setTimeseriesData();
    SwishjamAPI.Events.timeseries(event, property, { query_groups: JSON.stringify(whereClauseGroups), aggregation, timeframe, dataSource, include_comparison }).then(
      ({ timeseries, comparison_timeseries, grouped_by }) => {
        setTimeseriesData({
          groupedBy: grouped_by,
          timeseries: timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value
          }))
        });
      });
  }, [event, property, aggregation, timeframe, JSON.stringify(whereClauseGroups.map(group => group.queries))]);

  return (
    <LineChartWithValue
      groupedBy={timeseriesData?.groupedBy}
      timeseries={timeseriesData?.timeseries}
      title={title}
      subtitle={subtitle}
      {...settings}
      valueFormatter={value => {
        try {
          if (valueFormatter === 'currency') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value) / 100)
          } else if (valueFormatter === 'percent') {
            return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value)
          } else if (valueFormatter === 'number') {
            return parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
          } else {
            return value
          }
        } catch (error) {
          return value
        }
      }}
    />
  )
}