import { Checkbox } from "@/components/ui/checkbox";
import { Tooltipable } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export default function ExecutedAutomationsFilter({ automationSteps, onFilterChange }) {
  return (
    <div>
      <div className='text-sm w-full text-end flex items-center justify-end'>
        Filter by executions steps
        <Tooltipable className='text-start' content='Filter the execution log for executed automations that include a particular step.'>
          <div className='h-4 w-4 rounded-full inline-flex items-center justify-center ml-1 hover:bg-gray-100'>
            <InfoIcon className='w-3 h-3' />
          </div>
        </Tooltipable>
      </div>
      <div className='flex items-center space-x-2 flex-wrap justify-self-end mt-1'>
        {automationSteps?.map((step, i) => {
          if (['AutomationSteps::EntryPoint', 'AutomationSteps::Exit'].includes(step.type)) return;
          const hasMultipleStepTypes = automationSteps.filter(s => s.friendly_type === step.friendly_type).length > 0;
          let label = step.friendly_type;
          if (hasMultipleStepTypes) {
            switch (step.type) {
              case 'AutomationSteps::Delay':
                label = `Delay ${step.config.delay_amount} ${step.config.delay_unit}`;
                break;
              case 'AutomationSteps::SlackMessage':
                label = `"${step.config.message_header}" Slack Message`;
                break;
              case 'AutomationSteps::ResendEmail':
                label = `"${step.config.subject}" Email to ${step.config.to}`;
                break;
              case 'AutomationSteps::Filter':
                label = `${step.config.next_automation_step_condition_rules.map(({ property, operator, value }) => `${property} ${operator} ${value}`).join(' and ')} Filter`;
                break;
            }
          }
          return (
            <div key={i} className='text-xs text-gray-500 flex items-center space-x-1'>
              <Checkbox
                id={`step-${i}`}
                size={3}
                label={label}
                onCheckedChange={isChecked => onFilterChange({ stepId: step.id, stepName: label, isChecked })}
              />
            </div>
          )
        }).filter(Boolean)}
      </div>
    </div>
  )
}