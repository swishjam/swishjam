import { useEffect, useState } from "react";
import BarList from "@/components/Dashboards/Components/BarList";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function BarListDashboardComponent({ title, event, property, timeframe, dataSource }) {
  const [barListData, setBarListData] = useState();

  useEffect(() => {
    setBarListData();
    SwishjamAPI.Events.Properties.getCountsOfPropertyValues(event, property, { dataSource, timeframe }).then(data => {
      setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event, property, timeframe]);

  return (
    <BarList title={title} items={barListData} includeCard={false} />
  )
}
