'use client'
import { useState } from 'react';
import DemographicsCard from '@/components/DemographicsCard';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall/SnippetInstall';
import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import { calcCwvMetric } from '@/lib/cwvCalculations';
import { metricFormatterPlusUnits } from '@lib/utils';
import { WebVitalsApi } from '@/lib/api-client/web-vitals';

const formatDemographicData = (results, metricName) => {
  let formattedData = {}
  results.metrics.forEach(demographicData => {
    formattedData[demographicData[metricName]] = formattedData[demographicData[metricName]] || {};
    formattedData[demographicData[metricName]][demographicData.metric] = {
      value: demographicData.value,
      numRecords: demographicData.num_records,
    }
  });
  results.totalCount.forEach(countData => {
    formattedData[countData[metricName]] = formattedData[countData[metricName]] || {};
    formattedData[countData[metricName]].totalCount = countData.count;
  });
  return formattedData;
}

export default function VisitorDemographics() {
  const { currentProject } = useAuth();
  const [ urlPathsData, setUrlPathsData ] = useState();
  const [ urlPaths, setUrlPaths ] = useState([1]);
  const [ demographicData, setDemographicData ] = useState();

  const getAndSetDemographicData = async ({ urlHost }) => {
    const [byBrowser, byDeviceType] = await Promise.all([
      WebVitalsApi.getMetricsByBrowser({ urlHost }),
      WebVitalsApi.getMetricsByDeviceType({ urlHost }),
      // WebVitalsApi.getMetricsByConnectionType({ urlHost }),
    ]);
    setDemographicData({
      browser: formatDemographicData(byBrowser, 'browser_name'),
      deviceType: formatDemographicData(byDeviceType, 'device_type'),
    });
  }

  const onUrlHostSelected = urlHost => {
    setUrlPathsData(['1']);
    getAndSetDemographicData({ urlHost });
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Visitor Demographics</h1>
          </div>
          <div className='flex justify-end'>
            {<HostUrlFilterer onHostSelected={onUrlHostSelected} onNoHostsFound={() => {}} />}
          </div>
        </div>
        <div className="w-full my-6">
          {urlPathsData === undefined 
              ? (
                <div className='grid grid-cols-3 gap-6'>
                  {[1,2,3].map((i) => 
                  (<div key={i} className='rounded-lg border border-gray-200 p-4'>
                    <div className='animate-pulse w-32 h-10 bg-gray-200 rounded'></div>
                    <div className='flex'>
                      <div className='mx-auto my-40'>
                        <LoadingSpinner size={8} />
                      </div>
                    </div> 
                  </div>))}
                </div>
                  
              )
              : urlPaths.length === 0 
                ? <SnippetInstall projectId={currentProject?.public_id} /> 
                : (
                  <>
                    <div className='grid grid-cols-3 gap-6'>
                      <DemographicsCard title="Devices" />
                      <DemographicsCard title="Connection Types" />
                      <DemographicsCard title="Browsers" />
                    </div>
                    {demographicData && JSON.stringify(demographicData)}
                  </>
                )
          }
        </div>

      </main>
    </AuthenticatedView>
  )
}