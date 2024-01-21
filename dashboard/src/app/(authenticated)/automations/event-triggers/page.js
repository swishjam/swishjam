'use client';

import { Cog6ToothIcon, CursorArrowRaysIcon, PauseCircleIcon, PlayCircleIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EmptyState from '../EmptyState';
import Link from "next/link";
import Logo from '@components/Logo'
import { LuGitCommit } from "react-icons/lu";
import { SiSlack } from "react-icons/si";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Tooltipable } from '@/components/ui/tooltip'
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { SplitIcon } from 'lucide-react';

export default function () {
  const [triggers, setTriggers] = useState();
  const [hasSlackConnection, setHasSlackConnection] = useState();

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
    const [triggers, slackConnection] = await Promise.all([
      SwishjamAPI.EventTriggers.list(),
      SwishjamAPI.SlackConnections.get(),
    ]);
    setTriggers(triggers)
    setHasSlackConnection(slackConnection !== null);
  }

  useEffect(() => {
    loadTriggers()
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-medium text-gray-700 mb-0">Event Triggers</h2>
        {hasSlackConnection && (
          <Link
            className='duration-300 transition-all ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
            href='/automations/event-triggers/new'
          >
            Add Event Trigger
          </Link>
        )}
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
                <li key={trigger.id} className="bg-white relative flex items-center space-x-4 px-4 py-2 border border-gray-300 rounded">
                  <div className="min-w-0 flex-auto">
                    <div className="flex items-center gap-x-3">
                      <Logo className="h-4" />
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-gray-600">
                        <span className="truncate">{trigger.event_name}</span>
                      </h2>
                      <LuGitCommit className="w-4 h-4" />
                      {trigger.steps[0].type == 'EventTriggerSteps::Slack' && <SiSlack className="w-4 h-4" />}
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-gray-600">
                        <span className="truncate">#{trigger.steps[0].config.channel_name}</span>
                      </h2>
                      {trigger.conditional_statements?.length > 0 && (
                        <Tooltipable
                          content={
                            trigger.conditional_statements.map((statement, i) => (
                              <span className='block text-gray-700 text-xs'>{i + 1}. If {statement.property} {statement.condition.replace(/_/g, ' ')} "{statement.property_value}"</span>
                            ))
                          }
                        >
                          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 cursor-default">
                            {trigger.conditional_statements.length} <SplitIcon className='h-4 w-4 inline-block' />
                          </span>
                        </Tooltipable>
                      )}
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className='cursor-default'>
                        <div className='text-gray-600 flex items-center text-sm'>
                          {trigger.trigger_count_last_7_days}
                          <CursorArrowRaysIcon className='h-5 w-5 inline-block ml-1' />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className='text-xs text-gray-700'>
                        <p>Triggered {trigger.trigger_count_last_7_days} times in the last 7 days.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {trigger.enabled ?
                    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 capitalize">
                      <svg className="h-1.5 w-1.5 fill-green-500" viewBox="0 0 6 6" aria-hidden="true">
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      Enabled
                    </span> :
                    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                      <svg className="h-1.5 w-1.5 fill-red-500" viewBox="0 0 6 6" aria-hidden="true">
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      Disabled
                    </span>
                  }
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Cog6ToothIcon className="h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-36" align={'end'}>
                      <Link href={`/automations/event-triggers/${trigger.id}/edit`}>
                        <DropdownMenuItem className='cursor-pointer'>
                          <PencilSquareIcon className='h-4 w-4 inline-block mr-2' />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuGroup>
                        {trigger.enabled ?
                          <DropdownMenuItem onClick={() => pauseTrigger(trigger.id)} className="cursor-pointer">
                            <PauseCircleIcon className='h-4 w-4 inline-block mr-2' />
                            Pause
                          </DropdownMenuItem> :
                          <DropdownMenuItem onClick={() => resumeTrigger(trigger.id)} className="cursor-pointer">
                            <PlayCircleIcon className='h-4 w-4 inline-block mr-2' />
                            Resume
                          </DropdownMenuItem>
                        }
                        <DropdownMenuItem className="!text-red-400 cursor-pointer" onClick={() => deleteTrigger(trigger.id)}>
                          <TrashIcon className='h-4 w-4 inline-block mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </div>
        ) : <EmptyState title={hasSlackConnection ? "No Event Triggers" : <><Link className='text-blue-700 underline' href='/integrations/destinations'>Connect Slack</Link> to begin sending event triggers.</>} />
      )
      }
    </div>
  )
}