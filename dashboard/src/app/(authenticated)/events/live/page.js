'use client'

import EventFeed from "@/components/Dashboards/Components/EventFeed"
import { Tooltipable } from "@/components/ui/tooltip"
import PageWithHeader from "@/components/utils/PageWithHeader"
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { RefreshCcwIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const POLLING_THRESHOLD_SECONDS = 60 * 10;

export default function LiveEventsPage() {
  const [events, setEvents] = useState();
  const [isFetching, setIsFetching] = useState();
  const [isLive, setIsLive] = useState(true);
  const eventsRef = useRef();
  const pollingTresholdStartTimeRef = useRef();

  const getNewEventsWithHighlighting = async () => {
    const startTime = new Date();
    setIsFetching(true)
    const eventResults = await SwishjamAPI.Events.list();
    const previousEventUuids = new Set(eventsRef.current.map(e => e.uuid));
    const newEvents = eventResults.filter(e => !previousEventUuids.has(e.uuid));
    setEvents([
      ...newEvents.map(e => ({ ...e, isHighlighted: true })),
      ...eventsRef.current.map(e => ({ ...e, isHighlighted: false })),
    ]);
    const endTime = new Date() - startTime;
    if (endTime < 1_500) {
      setTimeout(() => setIsFetching(false), 1_500 - endTime);
    } else {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (!isLive) return;
    pollingTresholdStartTimeRef.current = new Date();
    const interval = setInterval(async () => {
      if (!eventsRef.current) return;
      const hasExceededPollingThreshold = new Date() - pollingTresholdStartTimeRef.current > (POLLING_THRESHOLD_SECONDS * 1_000);
      if (hasExceededPollingThreshold) {
        setEvents(eventsRef.current.map(e => ({ ...e, isHighlighted: false })))
        setIsLive(false)
        return;
      }
      getNewEventsWithHighlighting();
    }, 15 * 1_000);

    return () => clearInterval(interval);
  }, [isLive])

  useEffect(() => {
    SwishjamAPI.Events.list().then(setEvents);
  }, [])

  useEffect(() => {
    eventsRef.current = events;
  }, [events])

  return (
    <PageWithHeader title='Event Feed'>
      <EventFeed
        events={events}
        includeDateSeparators={true}
        displayShowMoreButton={false}
        noDataMsg="No events occurred yet, as they occur they will display here."
        title={
          <div className='flex justify-between'>
            <h2 className='text-lg'>Recent Events</h2>
            <div className='flex items-center'>
              {isFetching && <RefreshCcwIcon className='h-3 w-3 mr-2 text-gray-400 animate-spin' />}
              {isLive
                ? (
                  <div className='flex items-center space-x-2 px-2 py-1 rounded-md bg-green-100 text-green-600'>
                    <span className='text-sm'>Live</span>
                    <div className='h-2 w-2 rounded-full bg-green-600 animate-green-glow' />
                  </div>
                ) : (
                  <Tooltipable content={<>Realtime events have been paused from loading on this page after {POLLING_THRESHOLD_SECONDS / 60} minutes of activity. Click this badge to re-enable rendering realtime events.</>}>
                    <div
                      className='flex items-center space-x-2 px-2 py-1 rounded-md bg-red-100 text-red-600 transition-all cursor-pointer hover:bg-red-200 hover:text-red-700'
                      onClick={() => {
                        getNewEventsWithHighlighting();
                        setIsLive(true)
                      }}
                    >
                      <span className='text-sm'>Disabled</span>
                      <div className='h-2 w-2 rounded-full bg-red-600' />
                    </div>
                  </Tooltipable>
                )}
            </div>
          </div>
        }
      />
    </PageWithHeader>
  )
}