import { useEffect, useState } from 'react';
import AreaChartWithValue from "../AreaChartWithValue";
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import QueryDetailsComposer from '../utils/QueryDetailsComposer';

export default function AreaChartRenderingEngine({
  title,
  subtitle,
  event,
  property,
  aggregationMethod,
  dataSource,
  timeframe,
  whereClauseGroups = [],
  ...settings
}) {
  const [timeseriesData, setTimeseriesData] = useState();
  const include_comparison = settings.includeComparison ?? settings.include_comparison ?? settings.includeComparisonData ?? true;
  const valueFormatter = settings.value_formatter ?? settings.valueFormatter ?? 'number';

  useEffect(() => {
    setTimeseriesData();
    SwishjamAPI.Events.timeseries(event, property, { query_groups: JSON.stringify(whereClauseGroups), aggregation_method: aggregationMethod, timeframe, dataSource, include_comparison }).then(
      ({ timeseries, comparison_timeseries, grouped_by }) => {
        if (comparison_timeseries) {
          if (comparison_timeseries.length > timeseries.length) {
            comparison_timeseries = comparison_timeseries.slice(comparison_timeseries.length - timeseries.length);
          } else if (comparison_timeseries.length < timeseries.length) {
            timeseries = timeseries.slice(timeseries.length - comparison_timeseries.length);
          }
          setTimeseriesData({
            groupedBy: grouped_by,
            timeseries: timeseries.map((timeseries, index) => ({
              ...timeseries,
              comparisonDate: comparison_timeseries[index].date,
              comparisonValue: comparison_timeseries[index].value
            }))
          });
        } else {
          setTimeseriesData({ groupedBy: grouped_by, timeseries });
        }
      });
  }, [event, property, aggregationMethod, timeframe, aggregationMethod, include_comparison, JSON.stringify(whereClauseGroups.map(group => group.queries))]);

  return (
    <AreaChartWithValue
      groupedBy={timeseriesData?.groupedBy}
      QueryDetails={<QueryDetailsComposer event={event} property={property} aggregationMethod={aggregationMethod} whereClauseGroups={whereClauseGroups} />}
      subtitle={subtitle}
      timeseries={timeseriesData?.timeseries}
      title={title}
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