'use client';
import { useState, useEffect } from 'react';
import { BarList, Card, ColGrid, Title, Flex, Text, Bold } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import NewSiteDialog from '@components/NewSiteDialog';
import SnippetInstall from '@components/SnippetInstall';
import WebVitalCard from './WebVitalCard';
import { PlusIcon } from '@heroicons/react/20/solid'
import LoadingSpinner from './LoadingSpinner';
import LoadingFullScreen from './LoadingFullScreen';
import HostUrlFilterer from './HostUrlFilterer';
import { msToSeconds, cwvMetricBounds, calcCwvPercent } from '@lib/utils';
import { 
  GetCWVData, 
  GetCWVTimeSeriesData, 
  GetNavigationPerformanceEntriesData, 
  GetUrlHostsForCurrentProject, 
  // GetUrlPathsForCurrentProject 
} from '@lib/api';

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
  const [isLoadingPerformanceData, setIsLoadingPerformanceData] = useState(true);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [hostUrlFilterOptions, setHostUrlFilterOptions] = useState();

  const onUrlHostSelected = urlHost => {
    setHostUrlToFilterOn(urlHost);
    getPerformanceDataForCurrentProject(urlHost);
  }
  
  const getAndSetWebVitalMetric = (cwvKey, urlHost) => {
    return GetCWVData({ metric: cwvKey, urlHost }).then(res => {
      const pData = calcCwvPercent(res.average, cwvMetricBounds[cwvKey].good, cwvMetricBounds[cwvKey].medium );
      const currentCwv = { LCP: lcp, INP: inp, CLS: cls, FCP: fcp, FID: fid, TTFB: ttfb }[cwvKey];
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[cwvKey];      
      const metric = currentCwv.metricUnits === 's' ? msToSeconds(res.average) : 
                      currentCwv.metricUnits === 'ms' ? parseInt(res.average) : parseFloat(res.average).toFixed(4);
      setStateMethod(prevState => ({ ...prevState, metric, bounds: pData.bounds, metricPercent: pData.percent }));
    })
  };

  const getTimeseriesDataForMetric = (metric, urlHost) => {
    console.log(`Fetching timeseries data for ${urlHost}`)
    return GetCWVTimeSeriesData({ metric, urlHost }).then(chartData => {
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartData }));
      setIsLoadingPerformanceData(false);
    })
  }

  const setupUrlHostFilter = () => {
    return GetUrlHostsForCurrentProject().then(urlHosts => {
      setHostUrlFilterOptions(urlHosts);
      if (!hostUrlToFilterOn) {
        const likelyMainHostUrl = urlHosts.find(urlHost => urlHost.includes('www.')) || 
                                    urlHosts.find(urlHost => urlHost.includes('.com')) ||
                                    urlHosts.find(urlHost => urlHost.includes('https://')) ||
                                    urlHosts.find(urlHost => !urlHost.include('localhost')) ||
                                    urlHosts[0];
        setHostUrlToFilterOn(likelyMainHostUrl);
        onUrlHostSelected(likelyMainHostUrl);
      }
    });
  }

  const getPerformanceDataForCurrentProject = urlHost => {
    setIsLoadingPerformanceData(true);
    return Promise.all([
      getAndSetWebVitalMetric('LCP', urlHost),
      getAndSetWebVitalMetric('INP', urlHost),
      getAndSetWebVitalMetric('CLS', urlHost),
      getAndSetWebVitalMetric('FCP', urlHost),
      getAndSetWebVitalMetric('FID', urlHost),
      getAndSetWebVitalMetric('TTFB', urlHost),
      getTimeseriesDataForMetric('LCP', urlHost),
      getTimeseriesDataForMetric('CLS', urlHost),
      getTimeseriesDataForMetric('INP', urlHost),
      getTimeseriesDataForMetric('FCP', urlHost),
      getTimeseriesDataForMetric('FID', urlHost),
      getTimeseriesDataForMetric('TTFB', urlHost),
    ]).then(() => setIsLoadingPerformanceData(false))
  }

  useEffect(() => {
    if(!currentUserDataIsLoading) {
      if (currentProject) {
        setupUrlHostFilter();
      } else {
        setIsLoadingPerformanceData(false);
      }
    }
  }, [currentProject]);

  if(isLoadingPerformanceData) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 ">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium">Core Web Vitals {currentProject?.name && `for ${currentProject.name}`}</h1>
          </div>

          <div className="w-full text-end">
            {hostUrlFilterOptions && <HostUrlFilterer options={hostUrlFilterOptions}
                                                        selectedHost={hostUrlToFilterOn || hostUrlFilterOptions[0]}
                                                        onHostSelected={onUrlHostSelected} />}
          </div>
        </div>
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
            onComplete={() => setIsDialogOpen(false)}
          />
        </div>
      </div>
    )
  } else {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium">Core Web Vitals for {currentProject.name}</h1>
          </div>

          <div className="w-full text-end">
            <div>
              {hostUrlFilterOptions && <HostUrlFilterer options={hostUrlFilterOptions} 
                                                          selectedHost={hostUrlToFilterOn || hostUrlFilterOptions[0]}
                                                          onHostSelected={urlHost => {
                                                            setHostUrlToFilterOn(urlHost);
                                                            getPerformanceDataForCurrentProject(urlHost);
                                                          }} />}
            </div>
          </div>
        </div>

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

        {/* <div className="w-full my-6">
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
        </div> */}
      </main>
    );
  }

}
