import Modal from "@/components/utils/Modal"
import { Button } from "@/components/ui/button"
import { FlaskConicalIcon } from "lucide-react"
import { useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { AccordionOpen } from "@/components/ui/accordion";
import JsonEditor from "@/components/utils/JsonEditor";
import DottedUnderline from "@/components/utils/DottedUnderline";

export default function TestRunnerModal({
  automationId,
  eventName,
  eventProperties = { my_property: 'a value' },
  userProperties = { a_user_property: 'a value' },
  isOpen,
  onClose,
  onExecutionComplete = () => { }
}) {
  const [isExecutingTestRun, setIsExecutingTestRun] = useState(false);
  const [executedAutomation, setExecutedAutomation] = useState();
  const [eventPropertiesJson, setEventPropertiesJson] = useState({ my_property: 'a_value' });
  const [userPropertiesJson, setUserPropertiesJson] = useState({ a_user_property: 'a_value' });

  const executeTestRun = async () => {
    setIsExecutingTestRun(true);
    const { executed_automation, error } = await SwishjamAPI.Automations.testExecution({
      id: automationId,
      eventName,
      eventProperties: eventPropertiesJson,
      // userProperties: userPropertiesJson, // not used yet
    });
    if (error) {
      toast.error('Failed to execute test run', { description: error });
    } else {
      setExecutedAutomation(executed_automation);
      onExecutionComplete(executed_automation);
    }
    setIsExecutingTestRun(false);
  }

  return (
    <Modal title='Run Test Execution' onClose={onClose} isOpen={isOpen}>
      <div className='flex flex-col space-y-4 text-sm text-gray-700'>
        {isExecutingTestRun && <p>Executing test run...</p>}
        {executedAutomation && (
          <div>
            <p>Test run has been executed.</p>
            <p>Results:</p>
            <pre>{JSON.stringify(executedAutomation, null, 2)}</pre>
          </div>
        )}
        {!isExecutingTestRun && !executedAutomation && (
          <>
            <p>Running a test execution will execute the automation with a test user and provide you with the results of the execution.</p>
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