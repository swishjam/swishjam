'use client'

import AutomationBuilder from "@/components/Automations/Flow/Builder";
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { useEffect, useState } from "react"

export default function EditAutomationPage({ params }) {
  const { id: automationId } = params;

  const [automation, setAutomation] = useState();
  const [automationSteps, setAutomationSteps] = useState();

  const getAutomationDetails = async () => {
    const [automationResponse, automationStepsResponse] = await Promise.all([
      SwishjamAPI.Automations.retrieve(automationId),
      SwishjamAPI.Automations.AutomationSteps.list(automationId)
    ])
    setAutomation(automationResponse);
    setAutomationSteps(automationStepsResponse);
  }

  useEffect(() => {
    getAutomationDetails();
  }, [automationId])

  return (
    <AutomationBuilder
      automation={automation}
      automationSteps={automationSteps}
      onSave={({ name, nodes, edges }) => {
        console.log('saving', name, nodes, edges)
      }}
    />
  )
}