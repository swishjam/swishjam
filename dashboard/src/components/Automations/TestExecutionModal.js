import { AccordionOpen } from "@/components/ui/accordion";

import AutomationBuilder from "./Builder";
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, FlaskConicalIcon } from "lucide-react"
import { formatAutomationStepsWithExecutionStepResults, reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import JsonEditor from "@/components/utils/JsonEditor";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/utils/Modal"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import useAutomationBuilder from "@/hooks/useAutomationBuilder";
import { useState } from "react";
import ExecutedAutomationResultsBanner from "./Results/ExecutedAutomationResultsBanner";
import ExecutedAutomationLogs from "./Results/ExecutedAutomationLogs";

export default function TestExecutionModal({
  automationId,
  eventName,
  useSelectedEntryPointEventName,
  nodes,
  edges,
  eventProperties = { my_property: 'a value' },
  // userProperties = { a_user_property: 'a value' },
  isOpen,
  onClose,
  onExecutionComplete = () => { }
}) {
  const [automationStepsForExecutedAutomation, setAutomationStepsForExecutedAutomation] = useState();
  const [executedAutomation, setExecutedAutomation] = useState();
  // const [userPropertiesJson, setUserPropertiesJson] = useState(userProperties);
  const [isExecutingTestRun, setIsExecutingTestRun] = useState(false);
  const [eventPropertiesJson, setEventPropertiesJson] = useState(eventProperties);

  let selectedEventName = eventName;
  if (useSelectedEntryPointEventName) {
    const { selectedEntryPointEventName } = useAutomationBuilder();
    selectedEventName = selectedEntryPointEventName;
  }

  const executeTestRun = async () => {
    setIsExecutingTestRun(true);
    let payload = { eventName: selectedEventName, eventProperties: eventPropertiesJson }

    if (automationId) {
      payload.id = automationId;
    } else if (nodes && edges) {
      const {
        automation_steps: formattedAutomationSteps,
        next_automation_step_conditions: formattedNextAutomationStepConditions
      } = reformatNodesAndEdgesToAutomationsPayload({ nodes, edges })
      payload.configuration = {
        automation_steps: formattedAutomationSteps,
        next_automation_step_conditions: formattedNextAutomationStepConditions
      }
    }

    const { executed_automation, automation_steps, error } = await SwishjamAPI.Automations.testExecution(payload);
    if (error) {
      toast.error('Failed to execute test run', { description: error });
    } else {
      onExecutionComplete(executed_automation);
      setExecutedAutomation(executed_automation);
      setAutomationStepsForExecutedAutomation(automation_steps);
    }
    setIsExecutingTestRun(false);
  }

  const closeModal = () => {
    onClose()
    setTimeout(() => {
      setExecutedAutomation();
      setAutomationStepsForExecutedAutomation();
    }, 500)
  }

  return (
    <Modal
      isOpen={isOpen}
      title='Run Test Execution'
      size='x-large'
      onClose={closeModal}
    >
      <div className='flex flex-col space-y-4 text-sm text-gray-700'>
        {isExecutingTestRun && (
          <div className='flex items-center justify-center py-10'>
            <div>
              <LoadingSpinner size={8} center={true} />
              <p className='text-md font-semibold text-gray-700 mt-2'>Executing test run...</p>
            </div>
          </div>
        )}
        {executedAutomation && automationStepsForExecutedAutomation && (
          <>
            <ExecutedAutomationResultsBanner
              numExecutedSteps={executedAutomation.executed_automation_steps.length}
              numSteps={automationStepsForExecutedAutomation.length}
            />
            <ExecutedAutomationLogs
              executedAutomation={executedAutomation}
              timestampFormatterOptions={{ day: 'none', month: 'none', year: 'none', seconds: 'numeric', milliseconds: true }}
            />
          </>
        )}
        {!isExecutingTestRun && !executedAutomation && (
          <>
            <p>Running a test execution will simulate the automation with a test user and provide you with the results of the execution as if it occurred in production.</p>
            <p>Would you like to run a test execution?</p>
            <AccordionOpen trigger={<>Set the properties for the {eventName} test event.</>}>
              <JsonEditor json={eventPropertiesJson} onChange={setEventPropertiesJson} />
            </AccordionOpen>
            {/* <AccordionOpen trigger={<>Set the user properties for the <DottedUnderline className='mx-1'>{eventName}</DottedUnderline> test event.</>}>
              <JsonEditor json={userPropertiesJson} onChange={setUserPropertiesJson} />
            </AccordionOpen> */}
          </>
        )}
      </div>
      <div className='flex justify-end space-x-4 mt-6'>
        {executedAutomation && (
          <Button onClick={closeModal} variant='swishjam'>
            Done
          </Button>
        )}
        {!executedAutomation && (
          <>
            <Button disabled={isExecutingTestRun} onClick={closeModal} variant='outline'>
              Cancel
            </Button>
            <Button disabled={isExecutingTestRun} onClick={executeTestRun} variant='swishjam'>
              {isExecutingTestRun
                ? <LoadingSpinner size={4} color='white' className='mr-2' />
                : <FlaskConicalIcon className='h-4 w-4 mr-2' />}
              Execute Test Run
            </Button>
          </>
        )}
      </div>
    </Modal >
  )
}