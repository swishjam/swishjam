'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Link from "next/link";
import { useState } from "react";
import { LuPause, LuPlay, LuPencil, LuTrash, LuScrollText, LuMoreVertical } from "react-icons/lu";
import { toast } from "sonner";
import LoadingSpinner from "../LoadingSpinner";

export default function AutomationRow({ automation, onPause, onResume, onDelete, className }) {
  const [isLoading, setIsLoading] = useState(false);

  const pauseAutomation = async () => {
    setIsLoading(true)
    SwishjamAPI.Automations.disable(automation.id).then(({ automation, error }) => {
      setIsLoading(false)
      if (error) {
        toast.error("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        toast.success('Automation paused')
        onPause(automation)
      }
    })
  }

  const resumeAutomation = async () => {
    setIsLoading(true)
    SwishjamAPI.Automations.enable(automation.id).then(({ automation, error }) => {
      setIsLoading(false)
      if (error) {
        toast.error("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        toast.success('Automation resumed')
        onResume(automation)
      }
    })
  }

  const deleteAutomation = async () => {
    setIsLoading(true)
    SwishjamAPI.Automations.delete(automation.id).then(({ error }) => {
      setIsLoading(false)
      if (error) {
        toast.error("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        toast.success('Automation enqueued for deletion')
        onDelete(automation)
      }
    })
  }

  const relevantSteps = automation.automation_steps.filter(step => !['AutomationSteps::EntryPoint', 'AutomationSteps::Exit'].includes(step.type)).sort((a, b) => a.sequence_index - b.sequence_index)
  const stepsInDescription = relevantSteps.slice(0, 3);
  let description = stepsInDescription.map((step, i) => {
    let message;
    switch (step.type) {
      case 'AutomationSteps::SlackMessage':
        message = `send Slack message to #${step.config.channel_name}`
        break;
      case 'AutomationSteps::ResendEmail':
        message = `send ${step.config.subject} email to ${step.config.to}`
        break;
      case 'AutomationSteps::Delay':
        message = `wait for ${step.config.delay_amount} ${step.config.delay_unit}`
        break;
      case 'AutomationSteps::Filter':
        message = `continue if ${step.config.next_automation_step_condition_rules.length} condition${step.config.next_automation_step_condition_rules === 1 ? 's are' : ' is'} met`
        break;
    }
    if (relevantSteps.length <= 3) {
      if (i !== stepsInDescription.length - 1) message += ', ';
      if (i === stepsInDescription.length - 2) message += 'and ';
    }
    return message
  }).join('')
  if (relevantSteps.length > 3) description += `, and ${relevantSteps.length - 3} more...`

  return (
    <li key={automation.id} className={`grid grid-cols-4 bg-white relative px-4 py-2 border border-zinc-200 shadow-sm rounded-sm ${className}`}>
      <div className="col-span-3">
        <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto">
          {automation.name}
        </h2>
        <h3 className="text-xs text-gray-400">
          {relevantSteps.length < 1 ? 'Automation is empty' : description.charAt(0).toUpperCase() + description.slice(1)}
        </h3>
      </div>

      <div className="flex items-center space-x-2 justify-self-end">
        {isLoading && <LoadingSpinner className="h-4 w-4" />}
        {automation.enabled ?
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='p-1 rounded cursor-pointer duration-300 transition-all text-gray-500 hover:bg-gray-100  hover:text-swishjam'>
              <LuMoreVertical className="h-5 w-5" aria-hidden="true" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit border-zinc-200 shadow-sm border-sm" align='end'>
            <Link href={`/automations/${automation.id}/edit`}>
              <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                <LuPencil className='h-4 w-4 inline-block mr-2' />
                Edit
              </DropdownMenuItem>
            </Link>
            <Link href={`/automations/${automation.id}/history`}>
              <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                <LuScrollText className='h-4 w-4 inline-block mr-2' />
                History
              </DropdownMenuItem>
            </Link>
            <DropdownMenuGroup>
              {automation.enabled
                ? (
                  <DropdownMenuItem onClick={pauseAutomation} className="cursor-pointer hover:bg-accent">
                    <LuPause className='h-4 w-4 inline-block mr-2' />
                    Pause
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={resumeAutomation} className="cursor-pointer hover:bg-accent">
                    <LuPlay className='h-4 w-4 inline-block mr-2' />
                    Resume
                  </DropdownMenuItem>
                )
              }
              <DropdownMenuSeparator />
              <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent" onClick={deleteAutomation}>
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