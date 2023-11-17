import { useEffect, useState } from 'react';
import ValueCard from "@/components/Dashboards/Components/ValueCard";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function ValueCardRenderingEngine({ configuration, timeframe }) {
  const [value, setValue] = useState();
  const [previousValue, setPreviousValue] = useState();
  const [previousValueDate, setPreviousValueDate] = useState();
  const { title, event, property, calculation, dataSource } = configuration;

  useEffect(() => {
    setValue();
    setPreviousValue();
    setPreviousValueDate();
    // if (calculation === 'count') {
    SwishjamAPI.Events.count(event, { timeframe, dataSource }).then(({ count, comparison_count, comparison_start_time }) => {
      setValue(count);
      setPreviousValue(comparison_count);
      setPreviousValueDate(comparison_start_time);
    });
    // } else {
    // TODO: Support the other calculation types
    // }
  }, [event, property, calculation, timeframe]);

  return (
    <ValueCard title={title} value={value} previousValue={previousValue} previousValueDate={previousValueDate} includeCard={false} />
  )
}