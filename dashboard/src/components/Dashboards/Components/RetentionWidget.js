import { useState } from 'react'
import RetentionGrid from "./RetentionWidget/RetentionGrid";
import { CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Squares2X2Icon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react'
import LineChart from './RetentionWidget/LineChart';
import ConditionalCardWrapper from './ConditionalCardWrapper';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function RetentionWidget({ title = 'User Retention', retentionCohorts, isExpandable = true, includeCard = true }) {
  const [chartType, setChartType] = useState('grid');

  const toggleChartType = () => chartType === 'grid' ? setChartType('chart') : setChartType('grid');
  const isFetching = retentionCohorts === undefined;
  const hasRetentionData = retentionCohorts ? Object.keys(retentionCohorts).length > 0 : false;

  return (
    <ConditionalCardWrapper
      AdditionalHeaderActions={
        <TooltipProvider>
          <Tooltip delayDuration={300} className='cursor-default'>
            <TooltipTrigger>
              <div className="flex items-center space-x-2">
                <Switch
                  as='div'
                  checked={chartType === 'grid'}
                  onChange={toggleChartType}
                  disabled={!hasRetentionData}
                  className={classNames(
                    chartType === 'grid' && hasRetentionData ? 'bg-swishjam' : 'bg-gray-200',
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
      }
      includeCard={includeCard}
      title={title}
    >
      {!isFetching && !hasRetentionData && (
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