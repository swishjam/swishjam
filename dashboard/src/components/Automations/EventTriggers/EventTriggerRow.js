'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link";
import Logo from '@components/Logo'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Tooltipable } from '@/components/ui/tooltip'

import {
  LuPause, LuPlay,
  LuPencil, LuTrash, LuSettings,
  LuGitCommit, LuSplit, LuMousePointerClick,
} from "react-icons/lu";
const SlackIcon = () => (<img src={'/logos/slack.svg'} className="h-4 w-4" />) 
const ResendIcon = () => (<img src={'/logos/resend.png'} className="h-4 w-4" />) 

export default function EventTriggerRow({trigger, onPause, onResume, onDelete, className, ...props}) {

  const eventTriggerType = trigger.steps[0].type == 'EventTriggerSteps::Slack' ? 'slack' : 'resendEmail';
  const headerText = eventTriggerType == 'slack' ? `${trigger.steps[0].config.message_header}` : `${trigger.steps[0].config.subject}`;

  return (
    <li key={trigger.id} className={`bg-white relative px-4 py-2 border border-zinc-200 shadow-sm rounded-sm ${className}`}>
      <div className="flex items-center space-x-2">
        <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto">{headerText}</h2>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger className='cursor-default'>
              <div className='text-gray-600 flex items-center text-xs rounded-sm bg-accent px-1.5 py-0.5'>
                {trigger.trigger_count_last_7_days}
                <LuMousePointerClick className='h-3 w-3 inline-block ml-1' />
              </div>
            </TooltipTrigger>
            <TooltipContent className='text-xs text-gray-700'>
              <p>Triggered {trigger.trigger_count_last_7_days} times in the last 7 days.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {trigger.conditional_statements?.length > 0 && (
          <Tooltipable
            content={
              trigger.conditional_statements.map((statement, i) => (
                <span className='block text-gray-700 text-xs'>{i + 1}. If {statement.property} {statement.condition.replace(/_/g, ' ')} {statement.condition === 'is_defined' ? '' : `"${statement.property_value}"`}</span>
              ))
            }
          >
            <span className="inline-flex items-center gap-x-1.5 rounded-sm bg-accent px-1.5 py-0.5 text-xs font-medium text-gray-600 cursor-default">
              {trigger.conditional_statements.length} <LuSplit className='h-3 w-3 inline-block' />
            </span>
          </Tooltipable>
        )}

        {trigger.enabled ?
          <span className="inline-flex items-center gap-x-1.5 rounded-sm bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 capitalize">
            <svg className="h-1.5 w-1.5 fill-green-500" viewBox="0 0 6 6" aria-hidden="true">
              <circle cx={3} cy={3} r={3} />
            </svg>
            Enabled
          </span> :
          <span className="inline-flex items-center gap-x-1.5 rounded-sm bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
            <svg className="h-1.5 w-1.5 fill-red-500" viewBox="0 0 6 6" aria-hidden="true">
              <circle cx={3} cy={3} r={3} />
            </svg>
            Disabled
          </span>
        }
      </div>
      <div className="flex items-center space-x-2 mt-2">

        <div className="min-w-0 flex-auto">
          <div className="flex items-center gap-x-1.5">
            <Logo className="h-4" />
            <h2 className="min-w-0 text-xs font-semibold leading-6 text-gray-600">
              <span className="truncate">{trigger.event_name}</span>
            </h2>
            <LuGitCommit className="w-4 h-4" />
            
            {eventTriggerType == 'slack' &&
              <>
                <SlackIcon />
                <h2 className="min-w-0 text-xs font-semibold leading-6 text-gray-600">
                  <span className="truncate">#{trigger.steps[0].config.channel_name}</span>
                </h2>
              </>
            }
            {eventTriggerType == 'resendEmail' &&
              <>
                <ResendIcon />
                <h2 className="min-w-0 text-xs font-semibold leading-6 text-gray-600">
                  <span className="truncate">Send Email</span>
                </h2>
              </>
            }
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <LuSettings className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-36 border-zinc-200 shadow-sm border-sm" align={'end'}>
            <Link href={`/automations/event-triggers/${trigger.id}/edit`}>
              <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                <LuPencil className='h-4 w-4 inline-block mr-2' />
                Edit
              </DropdownMenuItem>
            </Link>
            <DropdownMenuGroup>
              {trigger.enabled ?
                <DropdownMenuItem onClick={() => onPause(trigger.id)} className="cursor-pointer hover:bg-accent">
                  <LuPause className='h-4 w-4 inline-block mr-2' />
                  Pause
                </DropdownMenuItem> :
                <DropdownMenuItem onClick={() => onResume(trigger.id)} className="cursor-pointer hover:bg-accent">
                  <LuPlay className='h-4 w-4 inline-block mr-2' />
                  Resume
                </DropdownMenuItem>
              }
              <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent" onClick={() => onDelete(trigger.id)}>
                <LuTrash className='h-4 w-4 inline-block mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}