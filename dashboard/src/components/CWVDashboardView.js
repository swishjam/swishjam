'use client';
import { useState, useEffect } from 'react';
import { ColGrid } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import NewSiteDialog from '@components/NewSiteDialog';
import SnippetInstall from '@components/SnippetInstall';
import ExperienceScoreCard from '@components/ExperienceScoreCard';
import WebVitalCard from '@components/WebVitalCard';
import { PlusIcon } from '@heroicons/react/20/solid'
import HostUrlFilterer from './HostUrlFilterer';
import { msToSeconds } from '@lib/utils';
import { cwvMetricBounds, calcCwvPercent, calcCwvMetric } from '@lib/cwvCalculations';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { PageViewsAPI } from '@/lib/api-client/page-views';
import { WebVitalsApi } from '@/lib/api-client/web-vitals';
import LoadingSpinner from './LoadingSpinner';

const initialCwvState = ({ key, title}) => ({ key, title, metric: null, timeseriesData: [{}] })

export default function CwvDashboardView() {
  const { initial: currentUserDataIsLoading, currentProject } = useAuth();

  const [lcp, setLCP] = useState(initialCwvState({ key: 'LCP', title: 'Largest Contentful Paint' }));
  const [inp, setINP] = useState(initialCwvState({ key: 'INP', title: 'Interaction to Next Paint' }));
  const [cls, setCLS] = useState(initialCwvState({ key: 'CLS', title: 'Cumulative Layout Shift' }));
  const [fcp, setFCP] = useState(initialCwvState({ key: 'FCP', title: 'First Contentful Paint' }));
  const [fid, setFID] = useState(initialCwvState({ key: 'FID', title: 'First Input Delay' }));
  const [ttfb, setTTFB] = useState(initialCwvState({ key: 'TTFB', title: 'Time to First Byte' }));
  const [numPageViews, setNumPageViews] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [hostUrlFilterOptions, setHostUrlFilterOptions] = useState();
  
  const [isFetchingCwvData, setIsFetchingCwvData] = useState(true);
  const [isFetchingHostUrlFilterOptions, setIsFetchingHostUrlFilterOptions] = useState(true);
  
  const getAndSetWebVitalMetric = (cwvKey, urlHost) => {
    return WebVitalsApi.getPercentileForMetric({ metric: cwvKey, urlHost: urlHost+'/blog', percentile: 0.75 }).then(res => {
      console.log(res)
      const metric = calcCwvMetric(res.percentile_result, cwvKey);
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[cwvKey];      
      setStateMethod(prevState => ({ ...prevState, metric }));
    })
  };

  const getTimeseriesDataForMetric = (metric, urlHost) => {
    return WebVitalsApi.timeseries({ metric, urlHost }).then(chartData => {
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      const chartDataMod = chartData.map(d => ({ ...d, metric: calcCwvMetric(d.p75, metric) })); 
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartDataMod }));
      setIsFetchingCwvData(false);
    })
  }

  const setupUrlHostFilter = () => {
    setIsFetchingHostUrlFilterOptions(true);
    setHostUrlToFilterOn(undefined);
    setHostUrlFilterOptions(undefined);
    return PageUrlsApi.getUniqueHosts().then(urlHosts => {
      setHostUrlFilterOptions(urlHosts);
      setIsFetchingHostUrlFilterOptions(false);
    });
  }

  const getPerformanceDataForCurrentProject = urlHost => {
    setIsFetchingCwvData(true);
    PageViewsAPI.getCount({ urlHost, urlPath: '/' }).then(setNumPageViews); 
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
    ]).then(() => setIsFetchingCwvData(false))
  }

  useEffect(() => {
    if(!currentUserDataIsLoading) {
      if (currentProject) {
        setupUrlHostFilter();
      } else {
        setIsFetchingCwvData(false);
        setIsFetchingHostUrlFilterOptions(false);
      }
    }
  }, [currentProject]);

  const shouldDisplayLoadingView = () => isFetchingCwvData || isFetchingHostUrlFilterOptions || currentUserDataIsLoading;
  const shouldDisplayNewProjectView = () => !currentProject && !currentUserDataIsLoading;
  const shouldDisplaySnippetInstallView = () => !currentUserDataIsLoading && currentProject && !isFetchingHostUrlFilterOptions && (!hostUrlFilterOptions || hostUrlFilterOptions.length === 0);

  
  if (shouldDisplayNewProjectView()) {
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
  } else if (shouldDisplaySnippetInstallView()) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="w-full my-6">
          <SnippetInstall projectId={currentProject?.public_id} />
        </div>
      </main>
    )
  } else if (shouldDisplayLoadingView()) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 ">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium">Core Web Vitals {currentProject?.name && `for ${currentProject.name}`}</h1>
          </div>

          <div className="w-full text-end">
            {/*hostUrlFilterOptions &&
              hostUrlFilterOptions.length > 0 &&
              <HostUrlFilterer options={hostUrlFilterOptions}
                selectedHost={hostUrlToFilterOn}
                onHostSelected={onUrlHostSelected} />*/}
          </div>
        </div>
        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          {[lcp, cls, inp, fcp, fid, ttfb].map(item => (
            <WebVitalCard
              key={item.key}
              accronym={item.key}
              title={item.title}
              metric={null}
              timeseriesData={item.timeseriesData}
            />
          ))}
        </ColGrid>
      </main>
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
              {hostUrlFilterOptions ? <HostUrlFilterer options={hostUrlFilterOptions} 
                                                          selectedHost={hostUrlToFilterOn}
                                                          onHostSelected={urlHost => {
                                                            setHostUrlToFilterOn(urlHost);
                                                            getPerformanceDataForCurrentProject(urlHost);
                                                          }} /> : <LoadingSpinner />}
            </div>
          </div>
        </div>

        <div className='mt-8 flex items-center'>
          {/*JSON.stringify(lcp)*/}
          <ExperienceScoreCard
            lcp={lcp}
            cls={cls}
            fcp={fcp}
            fid={fid}           
            pageViews={numPageViews}
          />
        </div>

        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          {[lcp, cls, inp, fcp, fid, ttfb].map(item => (
            <WebVitalCard
              key={item.key}
              accronym={item.key}
              title={item.title}
              metric={item.metric}
              timeseriesData={item.timeseriesData}
            />
          ))}
        </ColGrid>
      </main>
    );
  }

}
