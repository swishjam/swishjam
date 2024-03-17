import { AccordionOpen } from "@/components/ui/accordion";
import UserProfile from "@/lib/models/user-profile";
import ExpandableExecutionRowContent from "./ExpandableExecutionRowContent";
import ExecutedAutomationLogs from "./ExecutedAutomationLogs";
import ExecutedAutomationResultsBanner from "./ExecutedAutomationResultsBanner";

export default function ExecutedAutomationDetails({ automationSteps, executedAutomation }) {
  const user = executedAutomation.executed_on_user_profile.id ? new UserProfile(executedAutomation.executed_on_user_profile) : null;

  return (
    <AccordionOpen
      className='p-4 group'
      open={executedAutomation.justCompletedTestRun}
      trigger={<ExpandableExecutionRowContent executedAutomation={executedAutomation} user={user} />}
    >
      <div className='px-4 py-2'>
        <ExecutedAutomationResultsBanner
          numExecutedSteps={executedAutomation.executed_automation_steps.length}
          numSteps={automationSteps.length}
        />
        <ExecutedAutomationLogs executedAutomation={executedAutomation} />
      </div>
    </AccordionOpen>
  )
}
