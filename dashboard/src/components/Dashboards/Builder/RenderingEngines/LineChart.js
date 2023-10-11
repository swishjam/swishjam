import { useEffect, useState } from 'react';
import LineChartWithValue from "../../Components/LineChartWithValue";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function LineChartRenderingEngine({ title, event, property, calculation, timeframe, dataSource }) {
  const [timeseries, setTimeseries] = useState();
  const [currentValue, setCurrentValue] = useState();

  useEffect(() => {
    setTimeseries();
    setCurrentValue();
    // TODO: Endpoint doesn't do anything with property or calculation yet.
    SwishjamAPI.Events.timeseries(event, property, { calculation, timeframe, dataSource }).then(data => {
      setTimeseries(data);
      setCurrentValue(data[data.length - 1].value);
    });
  }, [event, property, calculation, timeframe]);

  return (
    <LineChartWithValue title={title} timeseries={timeseries} value={currentValue} includeCard={false} />
  )
}