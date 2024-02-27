'use client';

import { useState, useEffect } from "react";
import EmptyState from '@/components/utils/PageEmptyState';
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EventTriggerRow from "@/components/Automations/EventTriggers/EventTriggerRow";
import AddNewEventTriggerModal from "@/components/Automations/EventTriggers/AddNewTriggerModal";

export default function () {
  const [triggers, setTriggers] = useState();

  const pauseTrigger = async (triggerId) => {
    SwishjamAPI.EventTriggers.disable(triggerId).then(({ trigger, error }) => {
      if (error) {
        toast.message("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        setTriggers([...triggers.filter((t) => t.id !== triggerId), trigger])
      }
    })
  }

  const resumeTrigger = async (triggerId) => {
    SwishjamAPI.EventTriggers.enable(triggerId).then(({ trigger, error }) => {
      if (error) {
        toast.message("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        setTriggers([...triggers.filter((t) => t.id !== triggerId), trigger])
      }
    })
  }

  const deleteTrigger = async (triggerId) => {
    SwishjamAPI.EventTriggers.delete(triggerId).then(({ trigger, error }) => {
      if (error) {
        toast("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        setTriggers([...triggers.filter((t) => t.id !== triggerId)])
      }
    })
  }

  const loadTriggers = async () => {
    const triggers = await SwishjamAPI.EventTriggers.list()
    setTriggers(triggers)
  }

  useEffect(() => {
    loadTriggers()
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <AddNewEventTriggerModal />
      </div>
      {triggers === undefined ? (
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
      }
    </div>
  )
}