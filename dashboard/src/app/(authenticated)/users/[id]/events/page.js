'use client'

import Breadcrumbs from "@/components/Breadcrumbs";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function UserEventFeed({ params }) {
  const { id: userId } = params;
  const [recentEvents, setRecentEvents] = useState();
  const [userData, setUserData] = useState();

  useEffect(() => {
    SwishjamAPI.Users.retrieve(userId).then(setUserData);
    SwishjamAPI.Users.Events.list(userId, { limit: 100 }).then(setRecentEvents);
  }, [])

  const breadcrumbPaths = [
    { title: 'Users', url: '/users' },
    { title: userData?.full_name || userData?.email || `Un-named User: ${userData?.user_unique_identifier}`, url: `/users/${userId}` },
    { title: 'Event Feed' }
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <Breadcrumbs paths={breadcrumbPaths} />
      <div className='mt-8'>
        <EventFeed
          events={recentEvents}
          expandedContentFormatter={() => { }}
          includeDateSeparators={true}
          initialLimit={100}
          noDataMsg="No recent events"
          leftItemHeaderKey="name"
          leftItemSubHeaderFormatter={event => {
            if (event.name === 'page_view') {
              return JSON.parse(event.properties).url
            }
          }}
          rightItemKey="occurred_at"
          rightItemKeyFormatter={date => new Date(date).toLocaleTimeString('en-us', { hour: 'numeric', minute: "2-digit" })}
          title="Event Feed"
        />
      </div>
    </main>
  )
}