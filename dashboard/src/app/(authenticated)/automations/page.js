'use client';

import { useState, useEffect } from "react";
import EmptyState from '@/components/utils/PageEmptyState';
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EventTriggerRow from "@/components/Automations/EventTriggers/EventTriggerRow";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "src/lib/utils"
import Link from "next/link";
import { LuPlus } from "react-icons/lu";

export default function () {
  const [automations, setAutomations] = useState();

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

  const load = async () => {
    const automations = await SwishjamAPI.Automations.list()
    setAutomations(automations)
  }

  useEffect(() => {
    load()
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Automations</h1>
        </div>
        <div className="w-full flex items-center justify-end">
          <Link href="/automations/new" className={cn(buttonVariants({ variant: "swishjam" }))}>
            <LuPlus className="h-5 w-5" />   
            New Automation
          </Link> 
        </div>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-8">
        <div className="flex-1">
          <div>
            <div className="flex items-center justify-between">
            </div>
            {automations === undefined ? (
              <div>
                <ul role="list" className="w-full space-y-2 mt-8">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton className='w-full h-10' key={i} />)}
                </ul>
              </div>
            ) : (
              automations.length > 0 ? (
                <div>
                  <ul role="list" className="w-full space-y-2 mt-8">
                    {automations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(trigger => (
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
              ) : <EmptyState title={"No Automations"} />
            )
            }
          </div>

        </div>
      </div>
    </main>
  )
}

