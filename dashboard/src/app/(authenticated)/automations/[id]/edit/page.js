'use client'

import AutomationBuilder from "@/components/Automations/Builder";
import AutomationBuilderProvider from "@/providers/AutomationBuilderProvider";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import Link from "next/link";
import { ReactFlowProvider } from 'reactflow'
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { useEffect, useState } from "react"
import { reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import { toast } from "sonner";
import { LuArrowLeft } from "react-icons/lu";

export default function EditAutomationPage({ params }) {
  const { id: automationId } = params;

  const [automation, setAutomation] = useState();
  const [automationSteps, setAutomationSteps] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const getAutomationDetails = async () => {
    const [automationResponse, automationStepsResponse] = await Promise.all([
      SwishjamAPI.Automations.retrieve(automationId),
      SwishjamAPI.Automations.AutomationSteps.list(automationId)
    ])
    setAutomation(automationResponse);
    setAutomationSteps(automationStepsResponse);
  }

  const updateAutomationName = async name => {
    setIsLoading(true);
    setAutomation({ ...automation, name })
    const { error, automation: automationResult } = await SwishjamAPI.Automations.update(automationId, { name, nameOnly: true })
    setIsLoading(false);
    if (error) {
      setAutomation(automationResult);
      toast.error('Failed to update automation name', { description: error })
    } else {
      toast.success('Automation name updated.')
    }
  }

  const updateAutomation = async ({ nodes, edges }) => {
    setIsLoading(true);
    const { automation_steps, next_automation_step_conditions } = reformatNodesAndEdgesToAutomationsPayload({ nodes, edges })
    const { error } = await SwishjamAPI.Automations.update(automationId, { name: automation.name, automation_steps, next_automation_step_conditions })
    setIsLoading(false);
    if (error) {
      toast.error('Failed to update automation', { description: error })
    } else {
      toast.success('Automation updated.')
    }
    return { error }
  }

  useEffect(() => {
    getAutomationDetails();
  }, [automationId])

  return (
    automationSteps === undefined
      ? (
        <>
          <div className="w-full grid grid-cols-3 items-center bg-white border-b border-zinc-200 py-2 px-4" style={{ height: '75px' }}>
            <div>
              <Link
                className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center'
                href="/automations"
              >
                <LuArrowLeft className='inline mr-1' size={12} />
                Back to all Automations
              </Link>
            </div>
            <div className='bg-gray-200 h-12 w-24 animate-pulse rounded-md m-auto' />
            <div className='flex items-center justify-end space-x-2'>
              <div className='bg-gray-200 h-10 w-20 animate-pulse rounded-md' />
              <div className='bg-gray-200 h-10 w-20 animate-pulse rounded-md' />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center' style={{ height: 'calc(100vh - 75px)' }}>
            <div className='h-44 bg-gray-200 w-44 animate-pulse rounded-md mt-20' style={{ width: '300px' }} />
            <div className='w-1 bg-gray-200 h-56 animate-pulse' />
            <div className='h-44 bg-gray-200 w-44 animate-pulse rounded-md' style={{ width: '300px' }} />
            <div className='w-1 bg-gray-200 h-56 animate-pulse' />
            <div className='h-44 bg-gray-200 w-44 animate-pulse rounded-md' style={{ width: '300px' }} />
          </div>
        </>
      ) : (
        <CommonQueriesProvider>
          <ReactFlowProvider>
            <AutomationBuilderProvider isLoading={isLoading} initialAutomationSteps={automationSteps}>
              <AutomationBuilder
                automationName={automation?.name}
                automationSteps={automationSteps}
                onAutomationNameUpdated={updateAutomationName}
                onSave={updateAutomation}
              />
            </AutomationBuilderProvider>
          </ReactFlowProvider>
        </CommonQueriesProvider>
      )
  )
}