'use client'

import AutomationBuilder from "@/components/Automations/Flow/Builder-old";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewAutomationPage() {
  const [automation, setAutomation] = useState({ name: 'My New Automation' })
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const saveAutomation = async ({ nodes, edges }) => {
    const { automation_steps, next_automation_step_conditions } = reformatNodesAndEdgesToAutomationsPayload({ nodes, edges })
    const { error, automation: automationResult } = await SwishjamAPI.Automations.create({
      name: automation.name,
      entry_point_event_name: automation.entry_point_event_name,
      automation_steps,
      next_automation_step_conditions,
    })
    if (error) {
      toast.error('Failed to create automation', { description: error.message })
    } else {
      toast.success('Automation created')
      router.push(`/automations/flows/${automationResult.id}/edit`)
    }
  }

  return (
    <AutomationBuilder
      automation={automation}
      // automationSteps={[]}
      onSave={saveAutomation}
      onAutomationNameUpdated={name => setAutomation({ ...automation, name })}
      title='New Automation'
    />
  )
}