'use client';

import { useState, useEffect } from "react";
import AuthenticatedView from "@/components/AuthenticatedView";
import { ResourcePerformanceEntriesApi } from "@/lib/api-client/resource-performance-entries";
import { calculatedResourceTimings, formattedDate, bytesToHumanFileSize, formattedMsOrSeconds } from "@/lib/utils";
import { AreaChart } from "@tremor/react";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import Dropdown from "@/components/Dropdown";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  ArrowsRightLeftIcon,
  VideoCameraIcon,
  CodeBracketIcon, 
  CodeBracketSquareIcon, 
  DocumentTextIcon,
  PaintBrushIcon, 
} from "@heroicons/react/20/solid";

const METRICS_DROPDOWN_OPTIONS = [
  { name: 'Waiting Duration', value: 'waitingDuration' },
  { name: 'Redirect Duration', value: 'redirectDuration' },
  { name: 'DNS Lookup Duration', value: 'dnsLookupDuration' },
  { name: 'TCP Connection Duration', value: 'tcpDuration' },
  { name: 'TLS Connection Duration', value: 'tlsDuration' },
  { name: 'Initial Connection Duration', value: 'initialConnectionDuration' },
  { name: 'Time to First Byte Duration', value: 'timeToFirstByteDuration' },
  { name: 'Download Duration', value: 'downloadDuration' },
  { name: 'Total Duration', value: 'fetchDuration' },
  { name: 'Transfer Size', value: 'transferSize' },
];

const RESOURCE_TYPE_ICON_DICT = {
  'navigation': <DocumentTextIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'script': <CodeBracketIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'link': <PaintBrushIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'css': <PaintBrushIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'fetch': <ArrowsRightLeftIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'xmlhttprequest': <ArrowsRightLeftIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'beacon': <ArrowsRightLeftIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'iframe': <CodeBracketSquareIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'video': <VideoCameraIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
  'other': <ArrowsRightLeftIcon className='h-4 w-4 inline mr-2' aria-hidden="true" />,
}

const metricDataDiv = (metricName, metricValue, formatter = formattedMsOrSeconds) => {
  return (
    <div className="col-span-1">
      <div className='w-full border rounded-md border-gray-400 p-4 m-1 flex items-center justify-center'>
        <div className='text-center'>
          <span className='block text-sm'>{metricName}</span>
          {typeof metricValue === 'number' ? 
                  <span className='block text-2xl font-md'>{formatter(metricValue)}</span> : 
                  <div className='h-6 w-12 animate-pulse bg-gray-300 rounded-md m-auto mt-2' />}
        </div>
      </div>
    </div>
  )
}

export default function Resource({ params }) {
  const { url: encodedResourceUrl } = params;
  const resourceUrl = decodeURIComponent(encodedResourceUrl);

  const [resourceType, setResourceType] = useState();
  const [metricPercentile, setMetricPercentile] = useState('P75');
  const [metricsToChart, setMetricsToChart] = useState(['fetchDuration']);
  const [timeseriesData, setTimeseriesData] = useState();
  const [metricsData, setMetricsData] = useState({});

  const parsedMetricPercentile = parseInt(metricPercentile.replace('P', '')) / 100;

  const getTimeseriesData = async () => {
    return ResourcePerformanceEntriesApi.getTimeseriesData({ url: resourceUrl, percentile: parsedMetricPercentile }).then(timeseriesData => {
      setResourceType(timeseriesData[0] && timeseriesData[0].initiator_type);
      const formattedTimeseriesData = timeseriesData.map(entry => {
        const timings = calculatedResourceTimings(entry);
        return {
          name: entry.name,
          date: formattedDate(entry.hour),
          waitingDuration: timings.waiting,
          redirectDuration: timings.redirect,
          dnsLookupDuration: timings.dns,
          tcpDuration: timings.tcp,
          tlsDuration: timings.tls,
          initialConnectionDuration: timings.initialConnection,
          timeToFirstByteDuration: timings.request,
          downloadDuration: timings.response,
          fetchDuration: timings.entire,
          transferSize: entry.transfer_size,
        }
      })
      setTimeseriesData(formattedTimeseriesData);
    });
  };

  const getMetricData = async () => {
    return ResourcePerformanceEntriesApi.getMetricsData({ url: resourceUrl, percentile: parsedMetricPercentile }).then(metricData => {
      const timings = calculatedResourceTimings(metricData);
      setMetricsData({
        waitingDuration: timings.waiting,
        redirectDuration: timings.redirect,
        dnsLookupDuration: timings.dns,
        tcpDuration: timings.tcp,
        tlsDuration: timings.tls,
        initialConnectionDuration: timings.initialConnection,
        timeToFirstByteDuration: timings.request,
        downloadDuration: timings.response,
        fetchDuration: timings.entire,
        transferSize: metricData.transfer_size,
      })
    })
  };

  useEffect(() => {
    getTimeseriesData();
    getMetricData();
  }, [metricPercentile]);

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-3'>
          <div className='col-span-2'>
            <h1 className="text-xl font-medium">Resource Details</h1>
            <h2 className='text-md text-gray-500 flex items-center'>
              {resourceType && RESOURCE_TYPE_ICON_DICT[resourceType]}
              {resourceUrl}
            </h2>
          </div>
          <div className='col-span-1 flex justify-end'>
            <div className='w-fit mr-2'>
              <Dropdown label='Charting metric'
                options={['P99', 'P95', 'P90', 'P75', 'P50']}
                selected={metricPercentile}
                onSelect={percentile => {
                  setTimeseriesData(undefined);
                  setMetricsData({});
                  setMetricPercentile(percentile);
                }} />
            </div>
          </div>
        </div>
        <div className='w-full grid grid-cols-4 gap-4 mt-8'>
          {metricDataDiv('Total Duration', metricsData.fetchDuration)}
          {metricDataDiv('Time to First Byte', metricsData.timeToFirstByteDuration)}
          {metricDataDiv('Download Time', metricsData.downloadDuration)}
          {metricDataDiv('Initial Connection Time', metricsData.initialConnectionDuration)}
        </div>
        <div className='w-full grid grid-cols-5 gap-4'>
          {metricDataDiv('Redirect Duration', metricsData.redirectDuration)}
          {metricDataDiv('DNS Lookup Duration', metricsData.dnsLookupDuration)}
          {metricDataDiv('TLS Duration', metricsData.tlsDuration)}
          {metricDataDiv('TCP Duration', metricsData.tcpDuration)}
          {metricDataDiv('Transfer Size', metricsData.transferSize, bytesToHumanFileSize)}
        </div>
        <div className='w-full border rounded-md border-gray-400 p-4 mt-2'>
          <div className='w-full flex justify-end'>
            <div className='w-fit'>
              <MultiSelectDropdown label='Metrics to chart'
                                    onChange={setMetricsToChart} 
                                    selectedOptions={[{ name: 'Total Duration', value: 'fetchDuration' }]} 
                                    options={METRICS_DROPDOWN_OPTIONS} />
            </div>
          </div>
          {timeseriesData ? <AreaChart
                                  data={timeseriesData}
                                  dataKey="date"
                                  categories={metricsToChart}
                                  // colors={['blue']}
                                  showLegend={true}
                                  startEndOnly={false}
                                  valueFormatter={formattedMsOrSeconds}
                                  height="h-72"
                                  marginTop="mt-10"
                                /> : (
                                  <div className="flex justify-center items-center h-72">
                                    <LoadingSpinner size={8} />
                                  </div>
                                )
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}