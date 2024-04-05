'use client'

import { Button } from "@/components/ui/button";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import ExecutedAutomationDetails from "@/components/Automations/Results/ExecutedAutomationDetails";
import ExecutedAutomationsFilter from "@/components/Automations/Results/ExecutedAutomationsFilter";
import { Cog, FlaskConicalIcon, RefreshCcw } from "lucide-react";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import PageWithHeader from "@/components/utils/PageWithHeader";
import Pagination from "@/components/Pagination/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import TestExecutionModal from "@/components/Automations/TestExecutionModal";
import { useEffect, useState } from "react";

export default function AutomationDetailsPage({ params }) {
  const { id: automationId } = params;
  const [automation, setAutomation] = useState();
  const [automationSteps, setAutomationSteps] = useState();
  const [automationStepFilterIdsAndName, setAutomationStepFilterIdsAndName] = useState([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [executedAutomations, setExecutedAutomations] = useState();
  const [executedAutomationsTimeseries, setExecutedAutomationsTimeseries] = useState();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);
  const [totalNumPages, setTotalNumPages] = useState();

  const getAndSetExecutedAutomationsList = async ({ page, automationStepIds = [] } = {}) => {
    setExecutedAutomations();
    const { executed_automations, total_num_pages } = await SwishjamAPI.Automations.ExecutedAutomations.list(automationId, { page, limit: 10, automationStepIds });
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
      getAndSetExecutedAutomationsList({ page: currentPageNum, automationStepIds: automationStepFilterIdsAndName.map(step => step.id) }),
      getAndSetTimeseriesData(),
    ]);
    setIsFetchingData(false);
  }

  useEffect(() => {
    fetchAllPageData();
  }, [automationId])

  useEffect(() => {
    getAndSetExecutedAutomationsList({ page: currentPageNum, automationStepIds: automationStepFilterIdsAndName.map(step => step.id) });
  }, [currentPageNum, automationStepFilterIdsAndName])

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
          <Link href={`/automations/${automationId}/edit`}>
            <Button variant='outline' className='group'>
              <Cog className='h-4 w-4 mr-2 duration-500 transition-all group-hover:rotate-180' />
              Edit Automation
            </Button>
          </Link>
          <Button onClick={() => setTestExecutionModalIsOpen(true)} variant='swishjam' className='group'>
            <FlaskConicalIcon className='h-4 w-4 mr-2 transition-all group-hover:rotate-45' />
            Test Run
          </Button>
          <Button onClick={fetchAllPageData} variant='ghost' disabled={isFetchingData} className='group'>
            <RefreshCcw className={`h-4 w-4 duration-1000 transition-all group-hover:rotate-180 ${isFetchingData ? 'animate-spin' : ''}`} />
          </Button>
        </>
      }
    >
      <CommonQueriesProvider>
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
          <div className='px-4 py-8 grid grid-cols-2 items-center justify-between'>
            <h2 className='text-sm font-medium'>Execution Log</h2>
            {(automationSteps || []).length > 3 && (
              <ExecutedAutomationsFilter
                automationSteps={automationSteps}
                onFilterChange={({ stepId, isChecked, stepName }) => {
                  if (isChecked) {
                    setAutomationStepFilterIdsAndName([...automationStepFilterIdsAndName, { id: stepId, name: stepName }]);
                  } else {
                    setAutomationStepFilterIdsAndName(automationStepFilterIdsAndName.filter(({ id }) => id !== stepId));
                  }
                }}
              />
            )}
          </div>
          <div className='flex flex-col divide-y border-t border-gray-200'>
            {executedAutomations && automationSteps
              ? executedAutomations.length > 0
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
                ) : (
                  <div className='p-4 text-gray-500 text-center text-md py-8'>
                    The "{automation.name}" automation has not yet been executed{automationStepFilterIdsAndName.length > 0 && (
                      <>
                        {' '}with the{' '}
                        {automationStepFilterIdsAndName.slice(0, -1).map((step, i) => <span key={i} className='italic'>"{step.name}",</span>)}
                        {automationStepFilterIdsAndName.length > 1
                          ? <>{' '}and <span className='italic'>"{automationStepFilterIdsAndName[automationStepFilterIdsAndName.length - 1].name}"</span></>
                          : <span className='italic'>"{automationStepFilterIdsAndName[0]?.name}"</span>
                        }
                        {' '}automation step{automationStepFilterIdsAndName.length === 1 ? '' : 's'}
                      </>
                    )}.
                  </div>
                ) : Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className='h-20 bg-gray-200 mt-0.5 mx-1' />)
            }
          </div>
        </div>
      </CommonQueriesProvider>
    </PageWithHeader>
  )
}