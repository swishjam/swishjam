import ConditionalCardWrapper from './ConditionalCardWrapper';
import { CardTitle } from "@/components/ui/card";
import { InfoIcon } from 'lucide-react';
import LineChart from './RevenueRetentionWidget/LineChart';
import RetentionGrid from "./RevenueRetentionWidget/RetentionGrid";
import { Squares2X2Icon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import useSheet from '@/hooks/useSheet';
import { useState } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const DocumentationContent = () => (
  <>
    <p className='mb-2'>
      <strong className='block'>Definition:</strong>
      Revenue Retention is a visualization of how well your business retains its recurring revenue grouped by cohorts.
      Each cohort is comprised of a group of subscribers by the month in which their subscription began.
      Each cell in the grid represents the percentage of the recurring revenue that was retained based on the starting MRR for that cohort.
    </p>
    <p className='mb-2'>
      <strong className='block'>Example:</strong>
      Let's say you have 10 subscribers who started a $10 subscription in the month of January. The total MRR for those 10 subscribers is $100.
      If 5 of those subscribers churned in February, but 2 of them upgraded to a $20 subscription, then the retained MRR for February would be $70 (Five $10 subscriptions, and two $20 subscriptions).
      That means the revenue retention rate for February would be 70% (70 / 100 = 0.7).
    </p>
  </>
)

export default function RevenueRetentionWidget({ title = 'Revenue Retention', retentionCohorts, includeInAppDocs = true, isExpandable = true, includeCard = true }) {
  const { openSheetWithContent } = useSheet();
  const [chartType, setChartType] = useState('grid');

  const toggleChartType = () => chartType === 'grid' ? setChartType('chart') : setChartType('grid');
  const hasNoRetentionData = retentionCohorts && Object.keys(retentionCohorts).length === 0;

  return (
    <ConditionalCardWrapper
      includeCard={includeCard}
      title={
        <div className='flex items-center justify-between space-y-0'>
          <CardTitle className="text-sm font-medium cursor-default flex items-center gap-x-1">
            {title}
            {includeInAppDocs && (
              <a
                onClick={() => openSheetWithContent({ title, content: DocumentationContent })}
                className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
              >
                <InfoIcon className='h-3 w-3' />
              </a>
            )}
          </CardTitle>
          <TooltipProvider>
            <Tooltip delayDuration={300} className='cursor-default'>
              <TooltipTrigger>
                <div className="flex items-center space-x-2">
                  <Switch
                    as='div'
                    checked={chartType === 'grid'}
                    onChange={toggleChartType}
                    disabled={hasNoRetentionData}
                    className={classNames(
                      chartType === 'grid' && !hasNoRetentionData ? 'bg-swishjam' : 'bg-gray-200',
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out'
                    )}
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      className={classNames(
                        chartType === 'grid' ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                      )}
                    >
                      <span
                        className={classNames(
                          chartType === 'grid' ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
                          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                        )}
                        aria-hidden="true"
                      >
                        <ChartBarIcon className="h-3 w-3 text-gray-600" />
                      </span>
                      <span
                        className={classNames(
                          chartType === 'grid' ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                        )}
                        aria-hidden="true"
                      >
                        <Squares2X2Icon className='h-3 w-3 text-swishjam' />
                      </span>
                    </span>
                  </Switch>
                </div>
              </TooltipTrigger>
              <TooltipContent className='text-xs text-gray-700'>
                Toggle between grid and line chart retention data visualizations.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    >
      {hasNoRetentionData && (
        <div className='text-sm text-gray-500 text-center p-8 group'>
          <div className='my-8 mx-auto grid grid-cols-3 gap-2 w-20'>
            <div className='border-2 border-gray-300 rounded h-5 w-5 group-hover:border-swishjam duration-500 transition-all' />
            <div className='border-2 border-gray-300 rounded h-5 w-5 group-hover:border-swishjam duration-500 transition-all' />
            <div className='border-2 border-gray-300 rounded h-5 w-5' />
            <div className='border-2 border-gray-300 rounded h-5 w-5 group-hover:border-swishjam duration-500 transition-all' />
            <div className='border-2 border-gray-300 rounded h-5 w-5' />
            <div className='h-5 w-5' />
            <div className='border-2 border-gray-300 rounded h-5 w-5' />
          </div>
          <h3 className='tracking-tight text-sm font-medium cursor-default'>No Retention Data</h3>
          <p className='mt-2'>Send events and identify users <br />retention data will appear here</p>
        </div>
      )}
      {chartType === 'grid'
        ? <RetentionGrid retentionCohorts={retentionCohorts} isExpandable={isExpandable} />
        : <LineChart retentionCohorts={retentionCohorts} />
      }
    </ConditionalCardWrapper>
  )
}