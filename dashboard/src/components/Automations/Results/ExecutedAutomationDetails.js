import { AccordionOpen } from "@/components/ui/accordion";
import UserProfile from "@/lib/models/user-profile";
import ExpandableExecutionRowContent from "./ExpandableExecutionRowContent";
import ExecutedAutomationLogs from "./ExecutedAutomationLogs";
import ExecutedAutomationResultsBanner from "./ExecutedAutomationResultsBanner";
import { useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExecutedAutomationDetails({ automationSteps, executedAutomation }) {
  const user = executedAutomation.executed_on_user_profile?.id ? new UserProfile(executedAutomation.executed_on_user_profile) : null;
  const [executedAutomationDetails, setExecutedAutomationDetails] = useState();

  const getExecutionDetails = async () => {
    if (!executedAutomationDetails) {
      const { executed_automation } = await SwishjamAPI.Automations.ExecutedAutomations.retrieve(executedAutomation.automation_id, executedAutomation.id)
      setExecutedAutomationDetails(executed_automation)
    }
  }

  return (
    <AccordionOpen
      className='p-4 group'
      onOpen={getExecutionDetails}
      trigger={<ExpandableExecutionRowContent executedAutomation={executedAutomation} user={user} />}
    >
      <div className='px-4 py-2'>
        {executedAutomationDetails && (
          <>
            <ExecutedAutomationResultsBanner
              executedAutomationSteps={executedAutomationDetails.executed_automation_steps}
              numSteps={automationSteps.length}
            />
            <ExecutedAutomationLogs className='mt-4' executedAutomation={executedAutomationDetails} />
          </>
        )}
        {!executedAutomationDetails && <Skeleton className='h-72 w-full bg-gray-200' />}
      </div>
    </AccordionOpen>
  )
}
