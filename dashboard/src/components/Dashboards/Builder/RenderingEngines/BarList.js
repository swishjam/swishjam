import { useEffect, useState } from "react";
import BarList from "@/components/Dashboards/Components/BarList";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function BarListDashboardComponent({ configuration, timeframe }) {
  const [barListData, setBarListData] = useState();
  const { title, event, property, dataSource } = configuration;

  useEffect(() => {
    setBarListData();
    if (configuration.calculation === 'occurrences') {
      SwishjamAPI.Events.Properties.getCountsOfPropertyValues(event, property, { dataSource, timeframe }).then(data => {
        setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
      });
    } else if (configuration.calculation === 'users') {
      SwishjamAPI.Events.Users.list(event, { dataSource, limit: 10 }).then(data => {
        const formattedData = data.map(({ id, email, full_name: _full_name, count }) => {
          if (id) {
            return { name: email, value: count, href: `/users/${id}` }
          } else {
            return { name: <span className='italic'>Anonymous User</span>, value: count }
          }
        })
        setBarListData(formattedData);
      })
    }
  }, [event, property, timeframe]);

  return (
    <BarList
      color={configuration.barColor}
      includeCard={false}
      items={barListData}
      title={title}
    />
  )
}
