import { useEffect, useState } from 'react';
import ValueCard from "@/components/Dashboards/Components/ValueCard";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function ValueCardRenderingEngine({
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
  const [value, setValue] = useState();
  const [previousValue, setPreviousValue] = useState();
  const [previousValueDate, setPreviousValueDate] = useState();
  const include_comparison = settings.includeComparison ?? settings.include_comparison ?? settings.includeComparisonData ?? true;
  const valueFormatter = settings.value_formatter ?? settings.valueFormatter ?? 'number';

  useEffect(() => {
    setValue();
    setPreviousValue();
    setPreviousValueDate();

    if (!event) {
      return;
    }
    SwishjamAPI.Events.value(event, { property, query_groups: JSON.stringify(whereClauseGroups), aggregation, timeframe, dataSource, include_comparison })
      .then(({ value, comparison_value, comparison_start_time }) => {
        setValue(value);
        setPreviousValue(comparison_value);
        setPreviousValueDate(comparison_start_time);
      })
  }, [event, property, aggregation, timeframe, include_comparison, JSON.stringify(whereClauseGroups.map(group => group.queries))]);

  return (
    <ValueCard
      includeCard={false}
      {...settings}
      previousValue={previousValue}
      previousValueDate={previousValueDate}
      subtitle={subtitle}
      title={title}
      value={value}
      // override valueFormatter with custom logic
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