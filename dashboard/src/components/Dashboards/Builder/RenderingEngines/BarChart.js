import BarChart from "@/components/Dashboards/Components/BarChart";
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from "react";

export default function BarChartDashboardComponent({ title, subtitle, event, property, aggregation, dataSource, whereClauseGroups, timeframe, ...settings }) {
  const [barChartResults, setBarChartResults] = useState();

  const getData = async () => {
    setBarChartResults();
    if (event && property) {
      const { bar_chart_data, grouped_by } = await SwishjamAPI.Events.Properties.barChartForProperty(event, property, { aggregation, query_groups: JSON.stringify(whereClauseGroups || []), timeframe, dataSource });
      setBarChartResults({ data: bar_chart_data, groupedBy: grouped_by });
    }
  }

  useEffect(() => {
    getData();
  }, [event, property, aggregation, timeframe, JSON.stringify(whereClauseGroups.map(group => group.queries))]);

  return (
    <BarChart
      title={title}
      subtitle={subtitle}
      data={barChartResults?.data}
      groupedBy={barChartResults?.groupedBy}
      includeCard={false}
      {...settings}
    />
  )
}
