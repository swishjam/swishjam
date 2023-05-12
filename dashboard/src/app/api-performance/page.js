'use client';

import { useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView"
import { ResourcePerformanceEntriesApi } from "@/lib/api-client/resource-performance-entries";
import HostUrlFilterer from "@/components/Filters/HostUrlFilterer";
import PathUrlFilterer from "@/components/Filters/PathUrlFilterer";
import AreaChart from "@/components/Charts/AreaChart";
import { bytesToHumanFileSize, formattedDate, formattedMsOrSeconds } from "@/lib/utils";

export default function APIPerformance() {
  const [hasNoData, setHasNoData] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [apiData, setApiData] = useState();
  const [selectedAPI, setSelectedAPI] = useState();
  const [selectedAPITimeseriesData, setSelectedAPITimeseriesData] = useState();

  const getAPIData = async (urlHost, urlPath) => {
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths') delete params.urlPath;
    const xhrs = await ResourcePerformanceEntriesApi.getXHRResources(params);
    setApiData(xhrs);
    setSelectedAPI(xhrs[0]);
    getTimeseriesDataForAPIUrl(xhrs[0].url);
  }

  const getTimeseriesDataForAPIUrl = async url => {
    setSelectedAPITimeseriesData();
    const parsedSelectedAPIUrl = url.startsWith('http') ? new URL(url) : new URL(`https://${url}`);
    const params = { url, resourceUrlHost: parsedSelectedAPIUrl.host, resourceUrlPath: parsedSelectedAPIUrl.pathname };
    const data = await ResourcePerformanceEntriesApi.getTimeseriesData(params);
    setSelectedAPITimeseriesData(data);
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">API performance</h1>
          </div>
          <div className={`w-full flex items-center justify-end ${hasNoData ? 'hidden' : ''}`}>
            <HostUrlFilterer
              urlHostAPI='rum'
              onNoHostsFound={() => setHasNoData(true)}
              onHostsFetched={() => {
                setHasNoData(false);
                setApiData();
                setSelectedAPI();
                setSelectedAPITimeseriesData();
                setHostUrlToFilterOn();
              }}
              onHostSelected={hostUrl => {
                setHasNoData(false)
                setApiData();
                setSelectedAPI();
                setSelectedAPITimeseriesData();
                setHostUrlToFilterOn(hostUrl);
              }}
            />
            <div className='inline-block ml-2'>
              <PathUrlFilterer
                urlHost={hostUrlToFilterOn}
                urlPathAPI='rum'
                includeAllPathsSelection={true}
                onPathSelected={urlPath => getAPIData(hostUrlToFilterOn, urlPath)}
              />
            </div>
          </div>
        </div>
        <div className='border border-gray-400 rounded-md grid grid-cols-8 h-[80vh]'>
          <div className='col-span-2 border-r border-gray-400 h-full overflow-scroll h-[80vh]'>
            {apiData 
              ? (
                apiData.map(({ url, total_count, duration, transfer_size }, i) => (
                  <div 
                    className={`border-b border-gray-400 p-4 hover:bg-gray-100 cursor-pointer break-all ${url === selectedAPI?.url ? 'bg-gray-100 border border-gray-600' : ''}`}
                    key={i}
                    onClick={() => {
                      setSelectedAPI(apiData[i])
                      getTimeseriesDataForAPIUrl(url)
                    }}
                  >
                    <div className='text-sm font-medium text-gray-900'>{url}</div>
                    <div className='text-sm text-gray-500'>{total_count} total requests</div>
                    <div className='text-sm text-gray-500'>{formattedMsOrSeconds(duration)} duration</div>
                    {transfer_size && parseInt(transfer_size) !== 0 ? 
                      <div className='text-sm text-gray-500'>{bytesToHumanFileSize(transfer_size)}</div>
                      : null}
                  </div>
                ))
              ) : (
                Array.from({ length: 10 }).map((_, i) => (
                  <div className='border-b border-gray-400 p-1 animate-pulse' key={i}>
                    <div className='h-4 bg-gray-200 rounded w-1/2 m-1' />
                    <div className='h-4 bg-gray-200 rounded w-1/4 m-1' />
                    <div className='h-4 bg-gray-200 rounded w-1/4 m-1' />
                    <div className='h-4 bg-gray-200 rounded w-1/5 m-1' />
                  </div>
                ))
              )
            }
          </div>
          <div className='col-span-6 h-full p-4'>
            {selectedAPI
              ? <h2 className='text-lg font-medium text-gray-700'>{selectedAPI.url}</h2>
              : <div className='h-8 bg-gray-200 animate-pulse rounded w-1/2 m-1' />}
            <div className='grid grid-cols-3 gap-4 my-4'>
              <div className='border border-gray-400 rounded p-4'>
                <div className='text-sm font-medium text-gray-500'>Total requests</div>
                {selectedAPI
                  ? <h2 className='text-4xl font-bold text-gray-900'>{selectedAPI?.total_count}</h2>
                  : <div className='h-12 bg-gray-200 rounded w-1/2 m-1' />}
                
              </div>
              <div className='border border-gray-400 rounded p-4'>
                <div className='text-sm font-medium text-gray-500'>P75 request duration</div>
                {selectedAPI
                  ? <h2 className='text-4xl font-bold text-gray-900'>{selectedAPI && formattedMsOrSeconds(selectedAPI?.duration)}</h2>
                  : <div className='h-12 bg-gray-200 rounded w-1/2 m-1' />}
                
              </div>
              <div className='border border-gray-400 rounded p-4'>
                <div className='text-sm font-medium text-gray-500'>P75 transfer size</div>
                {selectedAPI
                  ? <h2 className='text-4xl font-bold text-gray-900'>{selectedAPI && bytesToHumanFileSize(selectedAPI?.transfer_size)}</h2>
                  : <div className='h-12 bg-gray-200 rounded w-1/2 m-1' />}
                
              </div>
            </div>
            <div className='border border-gray-400 rounded p-4'>
              <h5 className='text-sm font-medium text-gray-500 mb-2'>P75 request duration</h5>
              {selectedAPITimeseriesData 
                ? (
                  <AreaChart
                    data={selectedAPITimeseriesData} 
                    keys={['duration']} 
                    xAxisKey={'hour'} 
                    height='h-72'
                    width='w-full'
                    includeLegend={false}
                    yAxisDataFormatter={formattedMsOrSeconds}
                    xAxisDataFormatter={dateString => formattedDate(dateString, { includeTime: true })}
                  />
                ) : <div className='h-72 w-full bg-gray-200 rounded animate-pulse' />
              }
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedView>
  )
}