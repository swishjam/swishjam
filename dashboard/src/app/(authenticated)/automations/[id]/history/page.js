'use client'

import AutomationBuilderProvider from "@/providers/AutomationBuilderProvider";
import { Button } from "@/components/ui/button";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import ExecutedAutomationDetails from "@/components/Automations/Results/ExecutedAutomationDetails";
import { FlaskConicalIcon, RefreshCcw } from "lucide-react";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import PageWithHeader from "@/components/utils/PageWithHeader";
import Pagination from "@/components/Pagination/Pagination";
import { ReactFlowProvider } from "reactflow";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import TestExecutionModal from "@/components/Automations/TestExecutionModal";
import { useEffect, useState } from "react";

export default function AutomationDetailsPage({ params }) {
  const { id: automationId } = params;
  const [automation, setAutomation] = useState();
  const [automationSteps, setAutomationSteps] = useState();
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [executedAutomations, setExecutedAutomations] = useState();
  const [executedAutomationsTimeseries, setExecutedAutomationsTimeseries] = useState();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);
  const [totalNumPages, setTotalNumPages] = useState();

  const getAndSetExecutedAutomationsList = async page => {
    setExecutedAutomations();
    const { executed_automations, total_num_pages } = await SwishjamAPI.Automations.ExecutedAutomations.list(automationId, { page, limit: 10 });
    setExecutedAutomations(executed_automations);
    setTotalNumPages(total_num_pages);
    return { executed_automations, total_num_pages }
  }

  const getAndSetTimeseriesData = async () => {
    setExecutedAutomationsTimeseries();
    const { timeseries } = await SwishjamAPI.Automations.ExecutedAutomations.timeseries(automationId);
    setExecutedAutomationsTimeseries(timeseries);
    return { timeseries }
  }

  const getAutomationDetailsData = async () => {
    setAutomation();
    setAutomationSteps();
    const [automation, automationSteps] = await Promise.all([
      SwishjamAPI.Automations.retrieve(automationId),
      SwishjamAPI.Automations.AutomationSteps.list(automationId),
    ]);
    setAutomation(automation);
    setAutomationSteps(automationSteps);
    return { automation, automationSteps }
  }

  const fetchAllPageData = async () => {
    setIsFetchingData(true);
    await Promise.all([
      getAutomationDetailsData(),
      getAndSetExecutedAutomationsList(currentPageNum),
      getAndSetTimeseriesData(),
    ]);
    setIsFetchingData(false);
  }

  useEffect(() => {
    fetchAllPageData();
  }, [automationId])

  useEffect(() => {
    getAndSetExecutedAutomationsList(currentPageNum);
  }, [currentPageNum])

  return (
    <PageWithHeader
      title={
        <>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations"
          >
            <LuArrowLeft className='inline mr-1' size={12} />
            Back to all Automations
          </Link>
          Automation: {automation?.name}
        </>
      }
      buttons={
        <>
          <Button onClick={fetchAllPageData} variant='outline' disabled={isFetchingData}>
            <RefreshCcw className={`h-4 w-4 ${isFetchingData ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setTestExecutionModalIsOpen(true)} variant='swishjam' className='group'>
            <FlaskConicalIcon className='h-4 w-4 mr-2 transition-all group-hover:rotate-45' />
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
                {executedAutomations && automationSteps
                  ? (
                    <>
                      {executedAutomations.map((executionAutomation, i) => (
                        <ExecutedAutomationDetails
                          key={i}
                          automationSteps={automationSteps}
                          executedAutomation={executionAutomation}
                        />
                      ))}
                      <Pagination
                        className='pb-4'
                        currentPage={currentPageNum}
                        lastPageNum={totalNumPages}
                        onNewPageSelected={setCurrentPageNum}
                      />
                    </>
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