'use client'

import AutomationBuilder from "@/components/Automations/Flow/Builder";

export default function NewAutomationPage() {
  return (
    <div className="overflow-x-hidden">
      <AutomationBuilder
        automation={{ name: 'New Automation' }}
        automationSteps={[]}
        onSave={({ name, entryPointEventName, nodes, edges }) => {
          console.log('saving', name, entryPointEventName, nodes, edges)
        }}
        title='New Automation'
      />
    </div>
  )
}