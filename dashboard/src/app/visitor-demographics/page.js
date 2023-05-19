'use client'
import { useState } from 'react';
import DemographicsCard from '@/components/DemographicsCard';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall/SnippetInstall';
import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
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
  const [ demographicData, setDemographicData ] = useState();
  const [ hasNoData, setHasNoData ] = useState(false);

  const getAndSetDemographicData = async urlHost => {
    const [byBrowser, byDeviceType, byConnections] = await Promise.all([
      WebVitalsApi.getMetricsByBrowser({ urlHost }),
      WebVitalsApi.getMetricsByDeviceType({ urlHost }),
      WebVitalsApi.getMetricsByConnectionType({ urlHost }),
    ]);
    const formattedConnectionData = {};
    byConnections.forEach(connectionData => {
      if (connectionData.connection_range) {
        formattedConnectionData[connectionData.connection_range] = formattedConnectionData[connectionData.connection_range] || {};
        formattedConnectionData[connectionData.connection_range][connectionData.metric] = {
          value: connectionData.value,
          numRecords: connectionData.count,
        }
      }
    });
    for(const connectionRange in formattedConnectionData) {
      // not the best, we currently aren't returning the total count for connection types, so we are just taking the max of the individual metrics
      formattedConnectionData[connectionRange].totalCount = Math.max(...Object.values(formattedConnectionData[connectionRange]).map(cwv => cwv.numRecords));
    }
    setDemographicData({
      browser: formatDemographicData(byBrowser, 'browser_name'),
      deviceType: formatDemographicData(byDeviceType, 'device_type'),
      connectionType: formattedConnectionData
    });
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Visitor Demographics</h1>
          </div>
          <div className='flex justify-end'>
            {<HostUrlFilterer onHostSelected={getAndSetDemographicData} onNoHostsFound={() => setHasNoData(true)} />}
          </div>
        </div>
        <div className="w-full my-6">
          {hasNoData
                ? <SnippetInstall projectId={currentProject?.public_id} /> 
                : (
                  <>
                    <div className='grid grid-cols-3 gap-6'>
                      <DemographicsCard title="Devices" data={(demographicData || {}).deviceType} />
                      <DemographicsCard 
                        title="Connection Speed" 
                        data={(demographicData || {}).connectionType} 
                        sortFunction={(a, b) => parseInt(a.name.split('-')[0]) - parseInt(b.name.split('-')[0])} 
                      />
                      <DemographicsCard title="Browsers" data={(demographicData || {}).browser} />
                    </div>
                  </>
                )
          }
        </div>

      </main>
    </AuthenticatedView>
  )
}