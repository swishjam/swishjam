'use client'

import EventFeed from "@/components/Dashboards/Components/EventFeed"
import PageWithHeader from "@/components/utils/PageWithHeader"
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { RefreshCcwIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function LiveEventsPage() {
  const [events, setEvents] = useState();
  const [isFetching, setIsFetching] = useState();
  const eventsRef = useRef();

  useEffect(() => {
    SwishjamAPI.Events.list().then(setEvents);

    const interval = setInterval(async () => {
      if (!eventsRef.current) return;
      setIsFetching(true)
      const eventResults = await SwishjamAPI.Events.list();
      const previousEventUuids = new Set(eventsRef.current.map(e => e.uuid));
      const newEvents = eventResults.filter(e => !previousEventUuids.has(e.uuid));
      if (newEvents.length > 0) {
        setEvents([
          ...newEvents.map(e => ({ ...e, isHighlighted: true })),
          ...eventsRef.current.map(e => ({ ...e, isHighlighted: false })),
        ])
        // flip all events to isHighlighted = false after 5 seconds, this assumes the setInterval length is > 5 seconds
        setTimeout(() => setEvents(eventsRef.current.map(e => ({ ...e, isHighlighted: false }))), 5_000)
      }
      setIsFetching(false)
    }, 15 * 1_000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    eventsRef.current = events;
  }, [events])

  return (
    <PageWithHeader
      title='Event Feed'
      buttons={isFetching ? <RefreshCcwIcon className='h-4 w-4 mr-2 text-gray-400 animate-spin' /> : <></>}
    >
      <EventFeed events={events} displayShowMoreButton={false} />
    </PageWithHeader>
  )
}