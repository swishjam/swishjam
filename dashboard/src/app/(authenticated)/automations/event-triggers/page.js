'use client';

import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useState, useEffect } from "react";
import EmptyState from '../EmptyState';
import LoadingSpinner from "@/components/LoadingSpinner";
import { CursorArrowRaysIcon, PauseCircleIcon, PlayCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { SiSlack } from "react-icons/si";
import { LuGitCommit } from "react-icons/lu";
import Logo from '@components/Logo'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import AddTriggerModal from "@/components/Automations/EventTriggers/AddTriggerModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function () {
  const [triggers, setTriggers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSlackConnection, setHasSlackConnection] = useState();

  const pauseTrigger = async (triggerId) => {
    SwishjamAPI.EventTriggers.disable(triggerId).then(({ trigger, error }) => {
      if (error) {
        console.error(error)
        toast.messaage("Uh oh! Something went wrong.", {
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
        console.error(error)
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
        console.error(error)
        toast("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        setTriggers([...triggers.filter((t) => t.id !== triggerId)])
      }
    })
  }

  const loadTriggers = async () => {
    const triggers = await SwishjamAPI.EventTriggers.list();
    console.log(triggers)
    setTriggers(triggers)
    const slackConnection = await SwishjamAPI.SlackConnections.get();
    setHasSlackConnection(slackConnection !== null);
    setIsLoading(false)
  }

  useEffect(() => {
    loadTriggers()
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-medium text-gray-700 mb-0">Event Triggers</h2>
        {hasSlackConnection && <AddTriggerModal onNewTrigger={newTrigger => setTriggers([...triggers, newTrigger])} />}
      </div>
      {isLoading ?
        <div className="mt-24 h-5 w-5 mx-auto">
          <LoadingSpinner size={8} />
        </div> :
        (triggers?.length > 0 ?
          <div>
            <ul role="list" className="w-full space-y-2 mt-8">
              {triggers?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))?.map(trigger => (
                <li key={trigger.id} className="bg-white relative flex items-center space-x-4 px-4 py-2 border border-gray-300 rounded">
                  <div className="min-w-0 flex-auto">
                    <div className="flex items-center gap-x-3">
                      <Logo className="h-4" />
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-gray-600">
                        <span className="truncate">{`${trigger?.event_name}`}</span>
                      </h2>
                      <LuGitCommit className="w-4 h-4" />
                      {trigger.steps[0].type == 'EventTriggerSteps::Slack' && <SiSlack className="w-4 h-4" />}
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-gray-600">
                        <span className="truncate capitalize">#{trigger?.steps[0].config.channel_name}</span>
                      </h2>
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
                      <DropdownMenuLabel>Edit trigger</DropdownMenuLabel>
                      <DropdownMenuSeparator />
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
          </div> :
          <EmptyState title={hasSlackConnection ? "No Event Triggers" : <><Link className='text-blue-700 underline' href='/integrations/destinations'>Connect Slack</Link> to begin sending event triggers.</>} />
        )
      }
    </div>
  )
}