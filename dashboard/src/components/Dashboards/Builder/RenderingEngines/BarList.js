import { useEffect, useState } from "react";
import BarList from "@/components/Dashboards/Components/BarList";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function BarListDashboardComponent({ title, subtitle, event, property, dataSource, timeframe }) {
  const [barListData, setBarListData] = useState();

  useEffect(() => {
    setBarListData();
    if (configuration.calculation === 'occurrences') {
      SwishjamAPI.Events.Properties.getCountsOfPropertyValues(event, property, { dataSource, timeframe }).then(data => {
        setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
      });
    } else if (configuration.calculation === 'users') {
      SwishjamAPI.Events.Users.list(event, { dataSource, limit: 10 }).then(data => {
        const formattedData = data.map(({ user_profile_id, email, metadata, count }) => {
          return {
            name: email || <span className='italic'>Anonymous User {user_profile_id.slice(0, 6)}</span>,
            value: count,
            href: `/users/${user_profile_id}`
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
      subtitle={subtitle}
    />
  )
}
