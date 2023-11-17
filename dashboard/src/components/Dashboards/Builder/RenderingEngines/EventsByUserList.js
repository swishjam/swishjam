import { useEffect, useState } from "react";
import EventsByUserList from "@/components/Dashboards/Components/EventsByUserList";
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function EventsByUserListDashboardComponent({ configuration, timeframe }) {
  const [eventsByUserListData, setEventsByUserListData] = useState();
  const { title, event, dataSource } = configuration;

  useEffect(() => {
    setEventsByUserListData();
    SwishjamAPI.Events.Users.list(event, { dataSource, limit: configuration.numUsers }).then(data => {
      setEventsByUserListData(
        data.map(({ id, email, full_name: _full_name, count }) => {
          if (id) {
            return { name: email, value: count, href: `/users/${id}` }
          } else {
            return { name: 'Anonymous User', value: count }
          }
        })
      );
    });
  }, [event, timeframe]);

  return (
    <EventsByUserList
      title={title}
      items={eventsByUserListData}
      barColor={configuration.barColor}
      includeCard={false}
    />
  )
}
