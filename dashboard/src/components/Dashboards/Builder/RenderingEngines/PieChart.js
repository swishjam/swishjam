import { useState, useEffect } from 'react';
import PieChart from '../../Components/PieChart';
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function PieChartDashboardComponent({ configuration, timeframe }) {
  const [pieChartData, setPieChartData] = useState();
  const { title, event, property, calculation, dataSource } = configuration;

  useEffect(() => {
    setPieChartData();
    SwishjamAPI.Events.Properties.getCountsOfPropertyValues(event, property, { timeframe, dataSource }).then(data => {
      setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event, property, timeframe]);

  return (
    <PieChart title={title} data={pieChartData} includeCard={false} />
  )
}