import { useEffect, useState } from 'react';
import LineChartWithValue from "../../Components/LineChartWithValue";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function LineChartRenderingEngine({
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
  const include_comparison = settings.includeComparison ?? true;
  console.log('LineChartRenderingEngine', { event, property, aggregation, timeframe, whereClauseGroups, include_comparison });

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
          if (settings.value_formatter === 'currency') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value) / 100)
          } else if (settings.value_formatter === 'percent') {
            return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value)
          } else if (settings.value_formatter === 'number') {
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