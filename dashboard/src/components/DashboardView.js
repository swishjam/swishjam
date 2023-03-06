'use client';
import { useState, useEffect } from 'react';
import { BarList, Card, ColGrid, Title, Flex, Text, Bold } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import NewSiteDialog from '@components/NewSiteDialog';
import SnippetInstall from '@components/SnippetInstall';
import WebVitalCard from './WebVitalCard';
import { GetCWVData, GetCWVTimeSeriesData, GetNavigationPerformanceEntriesData } from '@lib/api';
import { msToSeconds, cwvMetricBounds, calcCwvPercent } from '@lib/utils';
import { PlusIcon } from '@heroicons/react/20/solid'
import LoadingSpinner from './LoadingSpinner';
import LoadingFullScreen from './LoadingFullScreen';

export default function DashboardView() {
  const { initial: currentUserDataIsLoading, projects, currentProject } = useAuth();

  const [lcp, setLCP] = useState({
    key: "LCP",
    title: "Largest Contentful Paint Average",
    metric: null,
    metricUnits: 's',
    timeseriesData: [{}]
  });
  const [inp, setINP] = useState({
    key: "INP",
    title: "Interaction to Next Paint Average",
    metric: null,
    metricUnits: 's',
    timeseriesData: [{}]
  });
  const [cls, setCLS] = useState({
    key: "CLS",
    title: "Cumulative Layout Shift Average",
    metric: null,
    metricUnits: '',
    timeseriesData: [{}]
  });
  const [fcp, setFCP] = useState({
    key: "FCP",
    title: "First Contentful Paint Average",
    metric: null,
    metricUnits: 's',
    timeseriesData: [{}]
  });
  const [fid, setFID] = useState({
    key: "FID",
    title: "First Input Delay Average",
    metric: null,
    metricUnits: 's',
    timeseriesData: [{}]
  });
  const [ttfb, setTTFB] = useState({
    key: "TTFB",
    title: "Time to First Byte Average",
    metric: null,
    metricUnits: 's',
    timeseriesData: [{}]
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [slowPageNavigations, setSlowPageNavigations] = useState();
  const [isLoadingPerformanceData, setisLoadingPerformanceData] = useState(true);
  
  const getAndSetWebVitalMetric = async  cwvKey => {
    return GetCWVData({ metric: cwvKey }).then(res => {
      const pData = calcCwvPercent(res.average, cwvMetricBounds[cwvKey].good, cwvMetricBounds[cwvKey].medium );
      const currentCwv = { LCP: lcp, INP: inp, CLS: cls, FCP: fcp, FID: fid, TTFB: ttfb  }[cwvKey];
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[cwvKey];      
      const metric = currentCwv.metricUnits === 's' ? msToSeconds(res.average) : 
                      currentCwv.metricUnits === 'ms' ? parseInt(res.average) : parseFloat(res.average).toFixed(4);
      setStateMethod(prevState => ({ ...prevState, metric, bounds: pData.bounds, metricPercent: pData.percent }));
    })
  };

  const getTimeseriesDataForMetric = metric => {
    return GetCWVTimeSeriesData({ metric }).then(chartData => {
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartData }));
      setisLoadingPerformanceData(false);
    })
  }

  const getSlowPageNavigations = () => {
    return GetNavigationPerformanceEntriesData({ metric: 'dom_interactive' }).then(res => {
      const formatted = res.records.map(item => ({ ...item, href: `/pages/${window.encodeURIComponent(item.name)}` }));
      setSlowPageNavigations(formatted);
    })
  }

  const getAnalyticDataForProject = async () => {
    return Promise.all([
      getAndSetWebVitalMetric('LCP'),
      getAndSetWebVitalMetric('INP'),
      getAndSetWebVitalMetric('CLS'),
      getAndSetWebVitalMetric('FCP'),
      getAndSetWebVitalMetric('FID'),
      getAndSetWebVitalMetric('TTFB'),
      getTimeseriesDataForMetric('LCP'),
      getTimeseriesDataForMetric('CLS'),
      getTimeseriesDataForMetric('INP'),
      getTimeseriesDataForMetric('FCP'),
      getTimeseriesDataForMetric('FID'),
      getTimeseriesDataForMetric('TTFB'),
      getSlowPageNavigations(),
    ]);
  }

  useEffect(() => {
    if(!currentUserDataIsLoading) {
      if (currentProject) {
        getAnalyticDataForProject().then(() => setisLoadingPerformanceData(false));
      } else {
        setSlowPageNavigations([]);
        setisLoadingPerformanceData(false);
      }
    }
  }, [currentProject]);

  if(isLoadingPerformanceData) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
        <h1 className="text-lg font-medium mt-8">Core Web Vitals {currentProject?.name && `for ${currentProject.name}`}</h1>
        <LoadingFullScreen />
      </main>
    )
  } else if (!projects || projects?.length === 0) {
    return (
      <div className="text-center mt-32">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z" />
        </svg>
        
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Create Your First Project</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first project to track.</p>
        <div className="mt-6">
          <button
            onClick={() => setIsDialogOpen(true)}
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Project
          </button>
          <NewSiteDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)} 
            onComplete={(newProject) => {console.log(newProject); setIsDialogOpen(false);}}
          />
        </div>
      </div>
    )
  } else {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
        <h1 className="text-lg font-medium mt-8">Core Web Vitals for {currentProject.name}</h1>

        {!isLoadingPerformanceData && !currentUserDataIsLoading && !fcp && currentProject?.public_id ?
        <div className="w-full my-6">
          <SnippetInstall projectId={currentProject?.public_id}/>     
        </div>:null
        }

        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          {[lcp, cls, inp, fcp, fid, ttfb].map(item => (
            <WebVitalCard
              key={item.key}
              accronym={item.key}
              title={item.title}
              metric={item.metric}
              metricUnits={item.metricUnits}
              metricPercent={item.metricPercent}
              bounds={item.bounds}
              timeseriesData={item.timeseriesData}
            />
          ))}
        </ColGrid>

        <div className="w-full my-6">
          <Card>
            <Title>Slowest Page Navigations</Title>
            <Flex marginTop="mt-4">
              <Text><Bold>Page URL</Bold></Text>
              <Text><Bold>DOM Interactive</Bold></Text>
            </Flex>
            {slowPageNavigations === undefined ? 
              (<LoadingSpinner />) : 
                slowPageNavigations.length === 0 ? 
                  (<Text>No slow page navigations found.</Text>) :
                  (<BarList data={slowPageNavigations} valueFormatter={value => `${msToSeconds(value)} s`} marginTop='mt-4' color='blue' />)
            }
          </Card>
        </div>
      </main>
    );
  }

}
