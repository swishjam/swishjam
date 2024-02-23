'use client';

import { ArrowLeftIcon } from "lucide-react";
import EmptyState from "@/components/utils/PageEmptyState";
import Link from "next/link";
import Pagination from "@/components/Pagination/Pagination";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import TriggeredEventTriggerRow from "@/components/Automations/EventTriggers/TriggeredEventTriggerRow";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function EventTriggerDetailsPage({ params }) {
  const { id } = params;
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [eventTrigger, setEventTrigger] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [lastPageNum, setLastPageNum] = useState();
  const [triggeredEventTriggers, setTriggeredEventTriggers] = useState();

  const getTriggeredEventTriggers = async page => {
    setIsLoading(true);
    setTriggeredEventTriggers();
    return await SwishjamAPI.EventTriggers.TriggeredEventTriggers.list(id, { page }).then((({ triggered_event_triggers, total_num_pages }) => {
      setTriggeredEventTriggers(triggered_event_triggers);
      setLastPageNum(total_num_pages);
      setIsLoading(false);
    }))
  }

  useEffect(() => {
    SwishjamAPI.EventTriggers.retrieve(id).then(({ trigger }) => setEventTrigger(trigger))
    getTriggeredEventTriggers(currentPageNum)
  }, [id]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="mt-8 grid grid-cols-2 items-center">
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
        </div>
        <div className="w-full flex items-center justify-end">
          <Button
            variant="outline"
            className={`duration-500 transition-all mr-4 hover:text-swishjam ${isLoading ? "cursor-not-allowed text-swishjam" : ""}`}
            onClick={() => getTriggeredEventTriggers(currentPageNum)}
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <h2 className="text-xs text-gray-500 flex items-center">
        When the {eventTrigger ? <span className='italic mx-1 underline decoration-dotted'>{eventTrigger.event_name}</span> : <Skeleton className='h-4 w-10 mx-1 bg-gray-200 inline-block' />} event is triggered,
        send the {eventTrigger ? <span className='italic mx-1 underline decoration-dotted'>{eventTrigger.steps[0].config?.subject}</span> : <Skeleton className='h-4 w-10 mx-1 bg-gray-200 inline-block' />} email.
      </h2>
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
                {triggeredEventTriggers.map((triggeredEventTrigger, i) => {
                  return (
                    <TriggeredEventTriggerRow
                      key={i}
                      triggeredEventTrigger={triggeredEventTrigger}
                      onCancelSuccess={canceledTriggeredEventTrigger => {
                        const updatedTriggeredEventTriggers = triggeredEventTriggers.map(triggeredEventTrigger => {
                          if (triggeredEventTrigger.id === canceledTriggeredEventTrigger.id) {
                            return canceledTriggeredEventTrigger;
                          }
                          return triggeredEventTrigger;
                        });
                        setTriggeredEventTriggers(updatedTriggeredEventTriggers);
                      }}
                      onRetrySuccess={({ newTrigger, retriedTrigger }) => {
                        const updatedTriggeredEventTriggers = triggeredEventTriggers.map(triggeredEventTrigger => {
                          if (triggeredEventTrigger.id === retriedTrigger.id) {
                            return retriedTrigger;
                          }
                          return triggeredEventTrigger;
                        });
                        setTriggeredEventTriggers([newTrigger, ...updatedTriggeredEventTriggers]);
                      }}
                    />
                  )
                })}
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