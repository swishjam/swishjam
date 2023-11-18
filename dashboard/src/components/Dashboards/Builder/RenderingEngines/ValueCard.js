import { useEffect, useState } from 'react';
import ValueCard from "@/components/Dashboards/Components/ValueCard";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function ValueCardRenderingEngine({ title, event, property, calculation, timeframe, dataSource, configuration }) {
  const [value, setValue] = useState();
  const [previousValue, setPreviousValue] = useState();
  const [previousValueDate, setPreviousValueDate] = useState();

  useEffect(() => {
    setValue();
    setPreviousValue();
    setPreviousValueDate();

    if (!event || !calculation) {
      return;
    } else if (calculation === 'count') {
      SwishjamAPI.Events.count(event, { dataSource, timeframe }).then(({ count, comparison_count }) => {
        setValue(count);
        setPreviousValue(comparison_count);
      });
      // the remaining calculation all require a property name
    } else if (property) {
      switch (calculation) {
        case 'sum':
          SwishjamAPI.Events.Properties.sum(event, property, { dataSource, timeframe }).then(({ sum, comparison_sum }) => {
            setValue(sum);
            setPreviousValue(comparison_sum);
          });
          break;
        case 'average':
          SwishjamAPI.Events.Properties.average(event, property, { dataSource, timeframe }).then(({ average, comparison_average }) => {
            setValue(average);
            setPreviousValue(comparison_average);
          });
          break;
        case 'max':
          SwishjamAPI.Events.Properties.maximum(event, property, { dataSource, timeframe }).then(({ maximum, comparison_maximum }) => {
            setValue(maximum);
            setPreviousValue(comparison_maximum);
          });
          break;
        case 'min':
          SwishjamAPI.Events.Properties.minimum(event, property, { dataSource, timeframe }).then(({ minimum, comparison_minimum }) => {
            setValue(minimum);
            setPreviousValue(comparison_minimum);
          });
          break;
        default:
          break;
      }
    }
  }, [event, property, calculation, timeframe]);

  return (
    <ValueCard
      includeCard={false}
      previousValue={previousValue}
      previousValueDate={previousValueDate}
      title={title}
      value={value}
      valueFormatter={value => {
        try {
          if (configuration.value_formatter === 'currency') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value) / 100)
          } else if (configuration.value_formatter === 'percent') {
            return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value)
          } else if (configuration.value_formatter === 'number') {
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