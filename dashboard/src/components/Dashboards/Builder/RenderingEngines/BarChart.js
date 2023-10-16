import BarChart from "@/components/Dashboards/Components/BarChart";
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from "react";

export default function BarListDashboardComponent({ title, event, property, timeframe, dataSource }) {
  const [barChartResults, setBarChartResults] = useState();

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
      data={barChartResults?.data}
      groupedBy={barChartResults?.groupedBy}
      includeCard={false}
    />
  )
}
