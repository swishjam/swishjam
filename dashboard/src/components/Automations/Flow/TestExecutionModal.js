import { AccordionOpen } from "@/components/ui/accordion";

import AutomationBuilder from "./Builder";
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, FlaskConicalIcon } from "lucide-react"
import DottedUnderline from "@/components/utils/DottedUnderline";
import { formatAutomationStepsWithExecutionStepResults, reformatNodesAndEdgesToAutomationsPayload } from "@/lib/automations-helpers";
import JsonEditor from "@/components/utils/JsonEditor";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/utils/Modal"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import useAutomationBuilder from "@/hooks/useAutomationBuilder";
import { useState } from "react";

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
  // const [automationStepsForExecutedAutomation, setAutomationStepsForExecutedAutomation] = useState();
  // const [executedAutomation, setExecutedAutomation] = useState();
  // const [userPropertiesJson, setUserPropertiesJson] = useState(userProperties);
  const [isExecutingTestRun, setIsExecutingTestRun] = useState(false);
  const [eventPropertiesJson, setEventPropertiesJson] = useState(eventProperties);
  const [automationStepsWithExecutionData, setAutomationStepsWithExecutionData] = useState();

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
      // setExecutedAutomation(executed_automation);
      // setAutomationStepsForExecutedAutomation(automation_steps)
      onExecutionComplete(executed_automation);
      const automationStepsSupplementedWithExecutionData = formatAutomationStepsWithExecutionStepResults({
        automationSteps: automation_steps,
        executedAutomation: executed_automation,
      });
      setAutomationStepsWithExecutionData(automationStepsSupplementedWithExecutionData);
    }
    setIsExecutingTestRun(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      title='Run Test Execution'
      size='x-large'
      onClose={() => {
        setAutomationStepsWithExecutionData();
        onClose()
      }}
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
        {automationStepsWithExecutionData && (
          <>
            <div className='w-full flex items-center bg-green-100 text-green-600 py-2 px-4 space-x-2'>
              <div className='flex-shrink-0'>
                <CheckCircleIcon className='h-6 w-6' />
              </div>
              <p className='text-sm font-semibold'>Test execution completed successfully. {(automationStepsWithExecutionData || [{ config: {} }]).filter(step => step.config.executionStepResults).length} out of {(automationStepsWithExecutionData || []).length} automation steps would have been executed.</p>
            </div>
            <AutomationBuilder
              automationSteps={automationStepsWithExecutionData}
              canvasWidth='w-full'
              canvasHeight='h-[60vh]'
              includeControls={true}
              includePanel={false}
            />
          </>
        )}
        {!isExecutingTestRun && !automationStepsWithExecutionData && (
          <>
            <p>Running a test execution will simulate the automation with a test user and provide you with the results of the execution.</p>
            <p>Are you sure you want to run a test execution?</p>
            <AccordionOpen trigger={<>Set the properties for the <DottedUnderline className='mx-1'>{eventName}</DottedUnderline> test event.</>}>
              <JsonEditor json={eventPropertiesJson} onChange={setEventPropertiesJson} />
            </AccordionOpen>
            {/* <AccordionOpen trigger={<>Set the user properties for the <DottedUnderline className='mx-1'>{eventName}</DottedUnderline> test event.</>}>
              <JsonEditor json={userPropertiesJson} onChange={setUserPropertiesJson} />
            </AccordionOpen> */}
          </>
        )}
      </div>
      <div className='flex justify-end space-x-4 mt-6'>
        <Button
          disabled={isExecutingTestRun}
          onClick={onClose}
          variant='outline'
        >
          Cancel
        </Button>
        <Button
          disabled={isExecutingTestRun}
          onClick={executeTestRun}
          variant='swishjam'
        >
          {isExecutingTestRun
            ? <LoadingSpinner size={4} color='white' className='mr-2' />
            : <FlaskConicalIcon className='h-4 w-4 mr-2' />}
          Execute Test Run
        </Button>
      </div>
    </Modal>
  )
}