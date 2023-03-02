'use client';
import AuthenticatedView from '@/components/AuthenticatedView';
import { AreaChart, Card, Title, Flex, Text, Bold } from '@tremor/react';
import { useEffect, useState } from "react";
import { msToSeconds } from "@/lib/utils";
import { GetResourceMetricTimeseries } from "@/lib/api";
import LoadingSpinner from '@/components/LoadingSpinner';

const loadingIndicator = () => {
  return (
    <div className='flex'>
      <div className='m-auto'>
        <LoadingSpinner size={8} />
      </div>
    </div>
  )
}

export default function Cwv({ params }) {
  const { name: encodedName } = params;
  const decodedName = decodeURIComponent(encodedName);
  const [timeseriesData, setTimeseriesData] = useState();

  useEffect(() => {
    GetResourceMetricTimeseries({ 
      siteId: 'sj-syv3hiuj0p51nks5', 
      resourceName: encodedName, 
      metric: 'duration' 
    }).then(res => {
      console.log(res);
      setTimeseriesData(res)
    });
  }, []);

  return (
    <>
      <AuthenticatedView>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
          <h1 className="text-lg font-medium mt-8">{decodedName}</h1>
          <div className='mt-6'>
            <Card>
              {timeseriesData === undefined ?
                loadingIndicator() :
                <AreaChart
                  data={timeseriesData}
                  dataKey="timestamp"
                  categories={['metric']}
                  colors={['blue']}
                  showLegend={false}
                  startEndOnly={true}
                  valueFormatter={value => `${msToSeconds(value)} s`}
                  height="h-48"
                  marginTop="mt-10"
                />
              }
            </Card>
            <Card>
              
            </Card>
          </div>
        </main>
      </AuthenticatedView>
    </>
  );
}