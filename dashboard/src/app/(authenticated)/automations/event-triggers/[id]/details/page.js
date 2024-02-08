'use client';

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EventTriggerRow from "@/components/Automations/EventTriggers/EventTriggerRow";
import AddNewEventTriggerModal from "@/components/Automations/EventTriggers/AddNewTriggerModal";

export default function EventTriggerDetailsPage({ params }) {
  const { id } = params;
  const [eventTrigger, setEventTrigger] = useState();
  const [triggeredEventTriggers, setTriggeredEventTriggers] = useState();

  useEffect(() => {
    SwishjamAPI.EventTriggers.retrieve(id).then(setEventTrigger)
    SwishjamAPI.EventTriggers.TriggeredEventTriggers.list(id).then(setTriggeredEventTriggers)
  }, [id]);

  console.log(eventTrigger, triggeredEventTriggers)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-medium text-gray-700 mb-0">Event Triggers</h2>
        <AddNewEventTriggerModal />
      </div>
      {/* {triggers === undefined ? (
        <div>
          <ul role="list" className="w-full space-y-2 mt-8">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton className='w-full h-10' key={i} />)}
          </ul>
        </div>
      ) : (
        triggers.length > 0 ? (
          <div>
            <ul role="list" className="w-full space-y-2 mt-8">
              {triggers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(trigger => (
                <EventTriggerRow
                  key={trigger.id}
                  trigger={trigger}
                  onPause={pauseTrigger}
                  onResume={resumeTrigger}
                  onDelete={deleteTrigger}
                />
              ))}
            </ul>
          </div>
        ) : <EmptyState title={"No Event Triggers"} />
      )
      } */}
    </div>
  )
}