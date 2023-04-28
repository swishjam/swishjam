'use client';

import AuthenticatedView from '@/components/AuthenticatedView';
import { useAuth } from '@components/AuthProvider';
import { useState } from 'react';
import Link from 'next/link';
import { LabTestsAPI } from '@/lib/api-client/lab-tests';
import LighthouseCard from '@/components/LabTests/LighthouseCard';
import PerformanceMetricCard from '@/components/LabTests/PerformanceMetricCard';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';
import { Cog6ToothIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { formattedMsOrSeconds } from '@/lib/utils';
import LabTestTab from '@/components/LabTests/LabTestTab';

const GOOD_NEEDS_IMPROVEMENT_POOR_TIERS = {
  largest_contentful_paint: {
    good: 2_500,
    needsImprovement: 4_000
  },
  total_blocking_time: {
    good: 300,
    needsImprovement: 600
  },
  max_first_input_delay: {
    good: 100,
    needsImprovement: 300
  },
  cumulative_layout_shift: {
    good: 0.1,
    needsImprovement: 0.25
  },
  speed_index: {
    good: 1_000,
    needsImprovement: 3_000
  },
  time_to_first_byte: {
    good: 800,
    needsImprovement: 1_800
  }
}

const METRIC_DICT = {
  largest_contentful_paint: {
    title: 'Largest Contentful Paint',
    description: 'description placeholder'
  },
  total_blocking_time: {
    title: 'Total Blocking Time',
    description: 'description placeholder'
  },
  max_first_input_delay: {
    title: 'First Input Delay',
    description: 'description placeholder'
  },
  cumulative_layout_shift: {
    title: 'Cumulative Layout Shift',
    description: 'description placeholder'
  },
  speed_index: {
    title: 'Speed Index',
    description: 'description placeholder'
  },
  time_to_first_byte: {
    title: 'Time to First Byte',
    description: 'description placeholder'
  }
}

export default function LabTests() {
  const { currentProject } = useAuth();
  const [hasNoData, setHasNoData] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [labTests, setLabTests] = useState();
  const [selectedMetric, setSelectedMetric] = useState('largest_contentful_paint');

  const getLabDataForUrlHostAndPath = (urlHost, urlPath) => {
    setLabTests();
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    LabTestsAPI.getAll(params).then(setLabTests);
  }

  const sortedLabTests = labTests ? labTests.sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at)) : undefined;
  
  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Lab tests for {currentProject?.name}</h1>
          </div>
          <div className={`w-full flex items-center justify-end ${hasNoData ? 'hidden' : ''}`}>
            <HostUrlFilterer 
              onNoHostsFound={() => setHasNoData(true)}
              urlHostAPI='lab'
              onHostSelected={hostUrl => {
                setHasNoData(false)
                setLabTests();
                setHostUrlToFilterOn(hostUrl);
              }} 
            />
            <div className='inline-block ml-2'>
              <PathUrlFilterer 
                urlHost={hostUrlToFilterOn}
                urlPathAPI='lab'
                includeAllPathsSelection={true}
                onPathSelected={urlPath => getLabDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)} 
              />
            </div>
            <div className='inline-block ml-2'>
              <Link href='/lab-tests/manage'>
                <Cog6ToothIcon className='h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer' />
              </Link>
            </div>
          </div>
        </div>
        {hasNoData 
          ? (
            <>
              <a
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                href='/lab-tests/manage'
              >
                <BeakerIcon className='mx-auto h-12 w-12 text-gray-700' />
                <span className="mt-2 block text-md font-semibold text-gray-700">No lab tests have run yet.</span>
                <span className="mt-2 block text-sm font-semibold text-gray-700">Manage your lab test configuration.</span>
              </a>
            </>
          ) : (
            <div className='rounded-md border border-gray-200 overflow-hidden'>
              <div className="grid grid-cols-1 md:grid-cols-6 md:divide-x">
                {[
                  { name: 'Largest Contentful Paint', metric: 'largest_contentful_paint' },
                  { name: 'Cumulative Layout Shift', metric: 'cumulative_layout_shift' },
                  { name: 'First Input Delay', metric: 'max_first_input_delay' },
                  { name: 'Total Blocking Time', metric: 'total_blocking_time' },
                  { name: 'Time to First Byte', metric: 'time_to_first_byte' },
                  { name: 'Speed Index', metric: 'speed_index' },
                ].map(({ name, metric }, i) => (
                  <LabTestTab 
                    title={name} 
                    isActive={metric === selectedMetric}
                    currentValue={sortedLabTests && sortedLabTests[sortedLabTests.length - 1]?.[metric]} 
                    previousValue={sortedLabTests && sortedLabTests[sortedLabTests.length - 2]?.[metric]}
                    goodNeedsImprovementPoorTiers={GOOD_NEEDS_IMPROVEMENT_POOR_TIERS[metric]}
                    isFirstTab={i === 0}
                    metric={metric}
                    key={i} 
                    onClick={() => setSelectedMetric(metric)} 
                  />
                ))}
              </div>
              <PerformanceMetricCard 
                labTests={sortedLabTests} 
                metric={selectedMetric} 
                title={METRIC_DICT[selectedMetric].title}
                description={METRIC_DICT[selectedMetric].description} 
              />
              {/* <LighthouseCard labTests={labTests} /> */}
            </div>
          )}
      </main>
    </AuthenticatedView>
  );
}
