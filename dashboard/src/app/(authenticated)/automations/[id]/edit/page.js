'use client'

import AutomationBuilder from "@/components/Automations/Flow/Builder";
import AutomationBuilderProvider from "@/providers/AutomationBuilderProvider";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import { ReactFlowProvider } from 'reactflow'
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { useEffect, useState } from "react"
import { reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import { toast } from "sonner";

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

  const updateAutomation = async ({ nodes, edges }) => {
    setIsLoading(true);
    const { automation_steps, next_automation_step_conditions } = reformatNodesAndEdgesToAutomationsPayload({ nodes, edges })
    const { error } = await SwishjamAPI.Automations.update(automationId, { name: automation.name, automation_steps, next_automation_step_conditions })
    setIsLoading(false);
    if (error) {
      toast.error('Failed to update automation', { description: error })
    } else {
      // setAutomation(automationResponse);
      toast.success('Automation updated.')
    }
  }

  useEffect(() => {
    getAutomationDetails();
  }, [automationId])

  return (
    <CommonQueriesProvider>
      <ReactFlowProvider>
        <AutomationBuilderProvider>
          {automation && automationSteps && (
            <AutomationBuilder
              automationName={automation?.name}
              automationSteps={automationSteps}
              onAutomationNameUpdated={name => setAutomation({ ...automation, name })}
              isLoading={isLoading}
              onSave={updateAutomation}
            />
          )}
        </AutomationBuilderProvider>
      </ReactFlowProvider>
    </CommonQueriesProvider>
  )
}