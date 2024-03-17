import { CheckIcon, ClockIcon, ScrollTextIcon, XIcon } from "lucide-react";
import ExecutedAutomationLogs from "./Results/ExecutedAutomationLogs";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import ResizableDrawer from "../utils/ResizableDrawer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { Tooltipable } from "../ui/tooltip";
import { useEffect, useState } from "react";

export default function ExecutionsDrawer({ automationId, height: collapsedHeight = '30px' }) {
  const [executedAutomations, setExecutedAutomations] = useState();
  const [selectedExecutedAutomation, setSelectedExecutedAutomation] = useState();
  const [totalNumPages, setTotalNumPages] = useState();

  useEffect(() => {
    if (automationId) {
      SwishjamAPI.Automations.ExecutedAutomations.list(automationId, { page: 1, limit: 50 }).then(({ executed_automations, total_num_pages }) => {
        setExecutedAutomations(executed_automations);
        setSelectedExecutedAutomation(executed_automations[0]);
        setTotalNumPages(total_num_pages);
      })
    }
  }, [automationId])

  return (
    <ResizableDrawer height={collapsedHeight} openText={<><ScrollTextIcon className='h-3 w-3 inline-block mr-1' /> Execution History</>}>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          id='automations'
          defaultSize={25}
          maxSize={50}
        >
          <div className='p-2'>
            <h3 className='text-sm'>Executions</h3>
          </div>
          <div className='border-t border-gray-200 h-full overflow-y-scroll'>
            {executedAutomations?.map(executedAutomation => (
              <div
                key={executedAutomation.id}
                className={`flex items-center justify-between text-xs hover:bg-gray-100 hover:text-swishjam cursor-pointer px-2 py-1 rounded-md transition-all ${selectedExecutedAutomation?.id === executedAutomation.id ? 'bg-gray-100 text-swishjam' : ''}`}
                onClick={() => setSelectedExecutedAutomation(executedAutomation)}
              >
                <div className='flex items-center space-x-2'>
                  <span className='font-mono'>{prettyDateTime(executedAutomation.started_at, { seconds: 'numeric', milliseconds: true })}</span>
                  {selectedExecutedAutomation?.id === executedAutomation.id && <div className='h-1 w-1 rounded-full bg-swishjam' />}
                </div>
                <div>
                  {executedAutomation.executed_automation_steps.filter(step => !step.completed_at && !step.error_message).length > 0 && (
                    <Tooltipable content={<>Automation has {executedAutomation.executed_automation_steps.filter(step => !step.completed_at && !step.error_message).length} pending execution steps.</>}>
                      <div className='text-xxs bg-blue-200 text-blue-700 flex items-center justify-center rounded-md px-1 py-0.5'>
                        {executedAutomation.executed_automation_steps.filter(step => !step.completed_at && !step.error_message).length}
                        <ClockIcon className='h-3 w-3 inline-block' />
                      </div>
                    </Tooltipable>
                  )}
                  {executedAutomation.executed_automation_steps.filter(step => step.completed_at && !step.error_message).length > 0 && (
                    <Tooltipable content={<>Automation had {executedAutomation.executed_automation_steps.filter(step => step.completed_at && !step.error_message).length} successful execution steps.</>}>
                      <div className='text-xxs bg-green-200 text-green-700 flex items-center justify-center rounded-md px-1 py-0.5'>
                        {executedAutomation.executed_automation_steps.filter(step => step.completed_at && !step.error_message).length}
                        <CheckIcon className='h-3 w-3 inline-block' />
                      </div>
                    </Tooltipable>
                  )}
                  {executedAutomation.executed_automation_steps.filter(step => step.error_message).length > 0 && (
                    <Tooltipable content={<>Automation had {executedAutomation.executed_automation_steps.filter(step => step.error_message).length} failed execution steps.</>}>
                      <div className='text-xxs bg-red-200 text-red-700 flex items-center justify-center rounded-md px-1 py-0.5'>
                        {executedAutomation.executed_automation_steps.filter(step => step.error_message).length}
                        <XIcon className='h-3 w-3 inline-block' />
                      </div>
                    </Tooltipable>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ResizablePanel>

        <ResizableHandle withhandle />
        <ResizablePanel id='logs' defaultSize={75}>
          <div className='p-2'>
            <h3 className='text-sm'>Logs</h3>
          </div>
          <div className='border-t border-gray-200 h-full overflow-y-scroll'>
            {selectedExecutedAutomation && <ExecutedAutomationLogs className='rounded-none !max-h-full' executedAutomation={selectedExecutedAutomation} />}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup >
    </ResizableDrawer >
  )
}