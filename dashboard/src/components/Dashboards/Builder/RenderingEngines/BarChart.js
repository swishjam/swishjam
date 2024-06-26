import BarChart from "@/components/Dashboards/Components/BarChart";
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from "react";

export default function BarListDashboardComponent({ configuration, timeframe }) {
  const [barChartResults, setBarChartResults] = useState();
  const { title, subtitle, event, property, dataSource } = configuration;

  useEffect(() => {
    setBarChartResults();
    SwishjamAPI.Events.Properties.barChartForProperty(event, property, { dataSource }).then(
      ({ bar_chart_data, grouped_by }) => {
        setBarChartResults({ data: bar_chart_data, groupedBy: grouped_by });
      }
    );
  }, [event, property, timeframe]);

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
