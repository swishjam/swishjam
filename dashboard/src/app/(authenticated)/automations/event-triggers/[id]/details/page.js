'use client';

import { ArrowLeftIcon } from "lucide-react";
import EmptyState from "../../../EmptyState";
import Link from "next/link";
import Pagination from "@/components/Pagination/Pagination";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import TriggeredEventTriggerRow from "@/components/Automations/EventTriggers/TriggeredEventTriggerRow";
import { useState, useEffect } from "react";

export default function EventTriggerDetailsPage({ params }) {
  const { id } = params;
  const [eventTrigger, setEventTrigger] = useState();
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [lastPageNum, setLastPageNum] = useState();
  const [triggeredEventTriggers, setTriggeredEventTriggers] = useState();

  const getTriggeredEventTriggers = async page => {
    return await SwishjamAPI.EventTriggers.TriggeredEventTriggers.list(id, { page }).then((({ triggered_event_triggers, total_num_pages }) => {
      setTriggeredEventTriggers(triggered_event_triggers);
      setLastPageNum(total_num_pages);
    }))
  }

  useEffect(() => {
    SwishjamAPI.EventTriggers.retrieve(id).then(({ trigger }) => setEventTrigger(trigger))
    getTriggeredEventTriggers(currentPageNum)
  }, [id]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations/event-triggers"
          >
            <ArrowLeftIcon className='inline mr-1' size={12} />
            Back to all Event Triggers
          </Link>
          <h1 className="text-lg font-medium text-gray-700 mb-0 flex items-center">
            {eventTrigger ? <span className='italic mx-1'>{eventTrigger.event_name}</span> : <Skeleton className='h-6 w-20 mx-1 bg-gray-200 inline-block' />} Event Trigger
          </h1>
          <h2 className="text-xs text-gray-500 flex items-center">
            When the {eventTrigger ? <span className='italic mx-1 underline decoration-dotted'>{eventTrigger.event_name}</span> : <Skeleton className='h-4 w-10 mx-1 bg-gray-200 inline-block' />} event is triggered,
            send the {eventTrigger ? <span className='italic mx-1 underline decoration-dotted'>{eventTrigger.steps[0].config?.subject}</span> : <Skeleton className='h-4 w-10 mx-1 bg-gray-200 inline-block' />} email.
          </h2>
        </div>
      </div>
      {
        triggeredEventTriggers === undefined ? (
          <div>
            <ul role="list" className="w-full space-y-2 mt-8">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton className='w-full h-20 bg-gray-200' key={i} />)}
            </ul>
          </div>
        ) : (
          triggeredEventTriggers.length > 0 ? (
            <div>
              <ul role="list" className="w-full space-y-2 mt-8">
                {triggeredEventTriggers.map((triggeredEventTrigger, i) => <TriggeredEventTriggerRow key={i} triggeredEventTrigger={triggeredEventTrigger} />)}
              </ul>
              {lastPageNum > 1 && (
                <div className='my-2 w-full bg-white rounded pb-4 border border-zinc-200 shadow-sm'>
                  <Pagination
                    className='border-none'
                    currentPage={currentPageNum}
                    lastPageNum={lastPageNum}
                    onNewPageSelected={newPageNum => {
                      setCurrentPageNum(newPageNum);
                      getTriggeredEventTriggers(newPageNum);
                    }}
                  />
                </div>
              )}
            </div>
          ) : <EmptyState title="This automation has not been triggered yet." />
        )
      }
    </main >
  )
}