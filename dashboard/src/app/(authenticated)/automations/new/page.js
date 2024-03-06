'use client'

import AutomationBuilder from "@/components/Automations/Flow/Builder";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewAutomationPage() {
  const [name, setName] = useState('New Automation')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter();

  const createAutomation = async ({ nodes, edges }) => {
    setIsSaving(true)
    const { automation_steps, next_automation_step_conditions } = reformatNodesAndEdgesToAutomationsPayload({ nodes, edges })
    const { automation, error } = await SwishjamAPI.Automations.create({ name, automation_steps, next_automation_step_conditions })
    if (error) {
      setIsSaving(false)
      toast.error('Failed to create automation', { description: error })
    } else {
      toast.success('Automation created')
      router.push(`/automations/${automation.id}/edit`)
    }
  }

  return (
    <div className="overflow-x-hidden">
      <AutomationBuilder
        automationName={name}
        automationSteps={[]}
        onAutomationNameUpdated={setName}
        isLoading={isSaving}
        onSave={createAutomation}
        title='New Automation'
      />
    </div>
  )
}