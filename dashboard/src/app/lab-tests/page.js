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

export default function LabTests() {
  const { currentProject } = useAuth();
  const [hasNoData, setHasNoData] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [labTests, setLabTests] = useState();

  const getLabDataForUrlHostAndPath = (urlHost, urlPath) => {
    setLabTests();
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    LabTestsAPI.getAll(params).then(setLabTests);
  }
  
  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Lab tests for {currentProject?.name}</h1>
          </div>
          <div className="w-full flex items-center justify-end">
            {!hasNoData && <HostUrlFilterer 
              onNoHostsFound={() => setHasNoData(true)}
              urlHostAPI='lab'
              onHostSelected={hostUrl => {
                setLabTests();
                setHostUrlToFilterOn(hostUrl);
              }} 
            />}
            <div className='inline-block ml-2'>
              {!hasNoData && <PathUrlFilterer 
                urlHost={hostUrlToFilterOn}
                urlPathAPI='lab'
                includeAllPathsSelection={true}
                onPathSelected={urlPath => getLabDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)} 
              />}
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
            <>
              <div className='grid grid-cols-3 gap-4 mb-4'>
                <PerformanceMetricCard labTests={labTests} title='Largest Contentful Paint' metric='largest_contentful_paint' color='lime' />
                <PerformanceMetricCard labTests={labTests} title='Cumulative Layout Shift' metric='cumulative_layout_shift' color='blue' />
                <PerformanceMetricCard labTests={labTests} title='First Input Delay' metric='max_first_input_delay' color='emerald' />
              </div>
              <div className='grid grid-cols-3 gap-4 mb-4'>
                <PerformanceMetricCard labTests={labTests} title='Time to First Byte' metric='time_to_first_byte' color='cyan' />
                <PerformanceMetricCard labTests={labTests} title='Total Blocking Time' metric='total_blocking_time' color='teal' />
                <PerformanceMetricCard labTests={labTests} title='Speed Index' metric='speed_index' color='fuchsia' />
              </div>
              <LighthouseCard labTests={labTests} />
            </>
          )}
      </main>
    </AuthenticatedView>
  );
}
