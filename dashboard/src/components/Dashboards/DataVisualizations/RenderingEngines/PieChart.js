import { useState, useEffect } from 'react';
import PieChart from '../PieChart';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import QueryDetailsComposer from '../utils/QueryDetailsComposer';

export default function PieChartDashboardComponent({ title, event, property, calculation, aggregationMethod, whereClauseGroups, dataSource, timeframe }) {
  const [pieChartData, setPieChartData] = useState();

  useEffect(() => {
    setPieChartData();
    SwishjamAPI.Events.Properties.getCountsOfPropertyValues(event, property, { timeframe, dataSource }).then(data => {
      setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event, property, timeframe]);

  return (
    <PieChart
      data={pieChartData}
      includeCard={false}
      QueryDetails={<QueryDetailsComposer event={event} property={property} aggregationMethod={aggregationMethod} whereClauseGroups={whereClauseGroups} />}
      title={title}
    />
  )
}