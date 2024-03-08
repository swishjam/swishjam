import { AccordionOpen } from "@/components/ui/accordion";
import UserProfile from "@/lib/models/user-profile";
import ExpandableExecutionRowContent from "./ExpandableExecutionRowContent";
import AutomationBuilder from "../Builder";
import { formatAutomationStepsWithExecutionStepResults } from "@/lib/automations-helpers";
import { CheckCircleIcon, CheckIcon } from "lucide-react";

export default function ExecutedAutomationDetails({ automationSteps, executedAutomation }) {
  const user = executedAutomation.executed_on_user_profile.id ? new UserProfile(executedAutomation.executed_on_user_profile) : null;
  const automationStepsWithExecutionResults = formatAutomationStepsWithExecutionStepResults({ automationSteps, executedAutomation })

  return (
    <AccordionOpen
      className='p-4 group'
      open={executedAutomation.justCompletedTestRun}
      trigger={<ExpandableExecutionRowContent executedAutomation={executedAutomation} user={user} />}
    >
      <div className='px-4 py-2'>
        <div className='bg-green-100 p-4 rounded-md text-green-600 flex items-center space-x-2'>
          <div className='w-full flex items-center bg-green-100 text-green-600 py-2 px-4 space-x-2'>
            <div className='flex-shrink-0'>
              <CheckCircleIcon className='h-6 w-6' />
            </div>
            <p className='text-sm font-semibold'>
              Automation executed {(automationStepsWithExecutionResults || [{ config: {} }]).filter(step => step.config.executionStepResults).length} out of {(automationStepsWithExecutionResults || []).length} automation steps.
            </p>
          </div>
        </div>
      </div>
      <AutomationBuilder automationSteps={automationStepsWithExecutionResults} includePanel={false} />
    </AccordionOpen>
  )
}
