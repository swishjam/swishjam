'use client'

import AutomationBuilder from "@/components/Automations/Builder";
import AutomationBuilderProvider from "@/providers/AutomationBuilderProvider";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { generateEmptyStateMockedAutomationSteps, reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReactFlowProvider } from 'reactflow'

export default function NewAutomationPage() {
  const [name, setName] = useState('New Automation')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter();

  const emptyStateMockedAutomationSteps = generateEmptyStateMockedAutomationSteps();

  const createAutomation = async ({ nodes, edges }) => {
    setIsSaving(true)
    const { automation_steps, next_automation_step_conditions } = reformatNodesAndEdgesToAutomationsPayload({ nodes, edges })
    const { automation, error } = await SwishjamAPI.Automations.create({ name, automation_steps, next_automation_step_conditions })
    if (error) {
      setIsSaving(false)
      toast.error('Failed to create automation', { description: error })
    } else {
      toast.success('Automation created')
      router.replace(`/automations/${automation.id}/edit`)
    }
  }

  return (
    <CommonQueriesProvider>
      <ReactFlowProvider>
        <AutomationBuilderProvider isLoading={isSaving} initialAutomationSteps={emptyStateMockedAutomationSteps}>
          <AutomationBuilder
            automationName={name}
            automationSteps={emptyStateMockedAutomationSteps}
            displayUnsavedChangesIndicator={false}
            onAutomationNameUpdated={setName}
            onSave={createAutomation}
          />
        </AutomationBuilderProvider>
      </ReactFlowProvider>
    </CommonQueriesProvider>
  )
}