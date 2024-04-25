import BarChart from "@/components/Dashboards/Components/BarChart";
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from "react";

export default function BarChartDashboardComponent({ configuration, timeframe }) {
  const [barChartResults, setBarChartResults] = useState();
  const { title, subtitle, event, property, dataSource, whereClauseGroups } = configuration;

  const getData = async () => {
    setBarChartResults();
    if (event && property) {
      const { bar_chart_data, grouped_by } = await SwishjamAPI.Events.Properties.barChartForProperty(event, property, { query_groups: JSON.stringify(whereClauseGroups || []), timeframe, dataSource });
      setBarChartResults({ data: bar_chart_data, groupedBy: grouped_by });
    }
  }

  useEffect(() => {
    getData();
  }, [event, property, timeframe, JSON.stringify(whereClauseGroups.map(group => group.queries))]);

  return (
    <BarChart
      title={title}
      subtitle={subtitle}
      data={barChartResults?.data}
      groupedBy={barChartResults?.groupedBy}
      includeCard={false}
    />
  )
}
