import { AccordionOpen } from "@/components/ui/accordion";
import UserProfile from "@/lib/models/user-profile";
import ExpandableExecutionRowContent from "./ExpandableExecutionRowContent";
import AutomationStepResultNode from "./AutomationStepResultNode";
import NodeConnector from "./NodeConnector";
import { CheckIcon } from "lucide-react";
import { prettyDateTime } from "@/lib/utils/timeHelpers";

export default function ExecutedAutomationDetails({ automationSteps, executedAutomation }) {
  const user = executedAutomation.executed_on_user_profile.id ? new UserProfile(executedAutomation.executed_on_user_profile) : null;

  const executedStepForAutomationStep = step => {
    return executedAutomation.executed_automation_steps.find(executedStep => executedStep.automation_step.id === step.id);
  }

  return (
    <AccordionOpen
      className='p-4 group'
      open={executedAutomation.justCompletedTestRun}
      trigger={<ExpandableExecutionRowContent executedAutomation={executedAutomation} user={user} />}
    >
      <div className='flex items-center justify-center flex-col pb-8'>
        {automationSteps?.map((step, i) => {
          const executedStep = executedStepForAutomationStep(step);
          const isLastStep = i === automationSteps.length - 1;
          return (
            <>
              <AutomationStepResultNode key={i} executedStep={executedStep} step={step} />
              {step.next_automation_step_conditions.map((condition, j) => (
                <NodeConnector
                  key={j}
                  condition={condition}
                  isPending={!executedAutomation.completed_at && !executedStep?.completed_at}
                  wasSatisfied={
                    (executedStep?.satisfied_next_automation_step_conditions || []).find(satisfiedCondition => satisfiedCondition.next_automation_step_condition_id === condition.id)
                  }
                />
              ))}
              {isLastStep && executedAutomation.completed_at && (
                <>
                  <NodeConnector
                    condition={{ next_automation_step_condition_rules: [] }}
                    isPending={false}
                    wasSatisfied={true}
                  />
                  <div className='relative rounded-md w-96 p-8 bg-green-100 text-green-500 border border-green-200 transition-all hover:bg-green-200'>
                    <div className='p-1.5 rounded-full bg-green-200 ring-1 ring-white flex items-center justify-center absolute top-2 right-2'>
                      <CheckIcon className='h-4 w-4' />
                    </div>
                    <div className='flex items-center justify-center space-x-2'>
                      <h3 className='text-lg font-bold text-green-700'>Automation Completed</h3>
                    </div>
                    <div className='mt-4 text-center'>
                      <span className='block text-sm font-semibold text-green-700'>Completed on {prettyDateTime(executedAutomation.completed_at)}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )
        })}
      </div >
    </AccordionOpen>
  )
}
