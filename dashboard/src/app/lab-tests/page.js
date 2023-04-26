'use client';

import AuthenticatedView from '@/components/AuthenticatedView';
import { useAuth } from '@components/AuthProvider';
import { useState } from 'react';
import { LabTestsAPI } from '@/lib/api-client/lab-tests';
import LighthouseCard from '@/components/LabTests/LighthouseCard';
import PerformanceMetricCard from '@/components/LabTests/PerformanceMetricCard';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';

export default function LabTests() {
  const { currentProject } = useAuth();
  const [hasNoData, setHasNoData] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [labTests, setLabTests] = useState();

  const getLabDataForUrlHostAndPath = (urlHost, urlPath) => {
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
            <HostUrlFilterer 
              onNoHostsFound={() => setHasNoData(true)}
              urlHostAPI='lab'
              onHostSelected={hostUrl => {
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
          </div>
        </div>
        <div className='grid grid-cols-3 gap-4 mb-4'>
          <PerformanceMetricCard labTests={labTests} title='Largest Contentful Paint' metric='largest_contentful_paint' />
          <PerformanceMetricCard labTests={labTests} title='Time to First Byte' metric='time_to_first_byte' />
          <PerformanceMetricCard labTests={labTests} title='Speed Index' metric='speed_index' />
        </div>
        <div className='grid grid-cols-3 gap-4 mb-4'>
          <PerformanceMetricCard labTests={labTests} title='Cumulative Layout Shift' metric='cumulative_layout_shift' />
          <PerformanceMetricCard labTests={labTests} title='Total Blocking Time' metric='total_blocking_time' />
          <PerformanceMetricCard labTests={labTests} title='Speed Index' metric='speed_index' />
        </div>
          <LighthouseCard labTests={labTests} />
      </main>
    </AuthenticatedView>
  );
}
