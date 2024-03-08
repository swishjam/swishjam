'use client'

import AutomationBuilderProvider from "@/providers/AutomationBuilderProvider";
import { Button } from "@/components/ui/button";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import { FlaskConicalIcon, RefreshCcw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageWithHeader from "@/components/utils/PageWithHeader";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import ExecutedAutomationDetails from "@/components/Automations/Flow/Results/ExecutedAutomationDetails";
import TestExecutionModal from "@/components/Automations/Flow/TestExecutionModal";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import { ReactFlowProvider } from "reactflow";
import { Skeleton } from "@/components/ui/skeleton";

export default function AutomationDetailsPage({ params }) {
  const { id: automationId } = params;
  const [automation, setAutomation] = useState();
  const [automationSteps, setAutomationSteps] = useState();
  const [executedAutomations, setExecutedAutomations] = useState();
  const [executedAutomationsTimeseries, setExecutedAutomationsTimeseries] = useState();
  const [isExecutingTestRun, setIsExecutingTestRun] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);

  const fetchAutomationData = async () => {
    setIsFetchingData(true);
    setExecutedAutomationsTimeseries();
    setExecutedAutomations();
    const [
      { automation },
      automationSteps,
      executedAutomations,
      { timeseries },
    ] = await Promise.all([
      SwishjamAPI.Automations.retrieve(automationId, {
        includeExecutionHistory: false,
        includeAutomationStepExecutionHistory: false,
        groupConditionsWithSteps: false,
      }),
      SwishjamAPI.Automations.AutomationSteps.list(automationId),
      SwishjamAPI.Automations.ExecutedAutomations.list(automationId),
      SwishjamAPI.Automations.ExecutedAutomations.timeseries(automationId),
    ]);
    setExecutedAutomationsTimeseries(timeseries);
    setAutomation(automation)
    setAutomationSteps(automationSteps);
    setExecutedAutomations(executedAutomations);
    setIsFetchingData(false);
  }

  useEffect(() => {
    fetchAutomationData();
  }, [automationId])

  return (
    <PageWithHeader
      title={`Automation: ${automation?.name}`}
      buttons={
        <>
          <Button onClick={fetchAutomationData} variant='outline' disabled={isFetchingData}>
            <RefreshCcw className={`h-4 w-4 ${isFetchingData ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setTestExecutionModalIsOpen(true)} variant='swishjam' disabled={isExecutingTestRun}>
            {isExecutingTestRun
              ? <LoadingSpinner size={4} color='white' className='mr-2' />
              : <FlaskConicalIcon className='h-4 w-4 mr-2' />}
            Test Run
          </Button>
        </>
      }
    >
      <CommonQueriesProvider>
        <ReactFlowProvider>
          <AutomationBuilderProvider>
            <TestExecutionModal
              automationId={automationId}
              // eventName={automation?.entry_point_event_name}
              isOpen={testExecutionModalIsOpen}
              onClose={() => setTestExecutionModalIsOpen(false)}
            />
            <LineChartWithValue
              includeSettingsDropdown={false}
              showAxis={true}
              timeseries={executedAutomationsTimeseries}
              title='Execution History'
              valueKey='count'
            />
            <div className='mt-8 bg-white rounded-md border border-gray-200'>
              <div className='px-4 py-8'>
                <h2 className='text-sm font-medium'>Execution Log</h2>
              </div>
              <div className='flex flex-col divide-y border-t border-gray-200'>
                {executedAutomations
                  ? (
                    executedAutomations.map((executionAutomation, i) => (
                      <ExecutedAutomationDetails
                        key={i}
                        automationSteps={automationSteps}
                        executedAutomation={executionAutomation}
                      />
                    ))
                  ) : Array.from({ length: 10 }).map((_, i) => <Skeleton className='h-20 bg-gray-200 mt-0.5' />)
                }
              </div>
            </div>
          </AutomationBuilderProvider>
        </ReactFlowProvider>
      </CommonQueriesProvider>
    </PageWithHeader>
  )
}