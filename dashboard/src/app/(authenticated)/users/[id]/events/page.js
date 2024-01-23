'use client'

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function UserEventFeed({ params }) {
  const { id: userId } = params;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentEvents, setRecentEvents] = useState();
  const [userData, setUserData] = useState();

  const getEvents = async () => {
    setIsRefreshing(true);
    setRecentEvents();
    await SwishjamAPI.Users.Events.list(userId, { limit: 100 }).then(setRecentEvents);
    setIsRefreshing(false);
  }

  useEffect(() => {
    SwishjamAPI.Users.retrieve(userId).then(setUserData);
    getEvents();
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='flex justify-between items-center'>
        <Breadcrumbs
          paths={[
            {
              title: 'Users',
              url: '/users'
            },
            {
              title: !userData ? <Skeleton className='h-8 w-12' /> : userData.full_name || userData.email || (userData.user_unique_identifier ? `Un-named User: ${userData.user_unique_identifier}` : `Anonymous User ${userData.id.slice(0, 6)}`),
              url: null
            }
          ]}
        />
        <Button
          variant="ghost"
          className={`duration-500 transition-all mr-4 hover:text-swishjam ${isRefreshing ? "cursor-not-allowed text-swishjam" : ""}`}
          onClick={getEvents}
          disabled={isRefreshing}
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
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
            } else if (event.name === 'click') {
              return JSON.parse(event.properties).clicked_text || JSON.parse(event.properties).clicked_id || JSON.parse(event.properties).clicked_class
            } else if (event.name === 'form_submit') {
              return JSON.parse(event.properties).form_id || JSON.parse(event.properties).form_action || JSON.parse(event.properties).form_class
            }
          }}
          rightItemKey="occurred_at"
          rightItemKeyFormatter={date => new Date(date).toLocaleTimeString('en-us', { hour: 'numeric', minute: "2-digit", second: "2-digit" })}
          title="Event Feed"
        />
      </div>
    </main>
  )
}