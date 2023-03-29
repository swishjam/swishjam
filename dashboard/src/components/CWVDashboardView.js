'use client';
import { useState } from 'react';
import { ColGrid } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import SnippetInstall from '@components/SnippetInstall';
import ExperienceScoreCard from '@components/ExperienceScoreCard';
import WebVitalCard from '@components/WebVitalCard';
import HostUrlFilterer from './Filters/HostUrlFilterer';
import { calcCwvMetric } from '@lib/cwvCalculations';
import { PageViewsAPI } from '@/lib/api-client/page-views';
import { WebVitalsApi } from '@/lib/api-client/web-vitals';
import PathUrlFilterer from './Filters/PathUrlFilterer';

const initialCwvState = ({ key, title}) => ({ key, title, metric: null, timeseriesData: [{}] })

export default function CwvDashboardView() {
  const { initial: currentUserDataIsLoading, currentProject } = useAuth();

  const [lcp, setLCP] = useState(initialCwvState({ key: 'LCP', title: 'Largest Contentful Paint' }));
  const [inp, setINP] = useState(initialCwvState({ key: 'INP', title: 'Interaction to Next Paint' }));
  const [cls, setCLS] = useState(initialCwvState({ key: 'CLS', title: 'Cumulative Layout Shift' }));
  const [fcp, setFCP] = useState(initialCwvState({ key: 'FCP', title: 'First Contentful Paint' }));
  const [fid, setFID] = useState(initialCwvState({ key: 'FID', title: 'First Input Delay' }));
  const [ttfb, setTTFB] = useState(initialCwvState({ key: 'TTFB', title: 'Time to First Byte' }));
  const [numPageViews, setNumPageViews] = useState();

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [urlPathToFilterOn, setUrlPathToFilterOn] = useState();
  
  const [isFetchingCwvData, setIsFetchingCwvData] = useState(true);
  const [hasNoData, setHasNoData] = useState();
  
  const getAndSetWebVitalMetric = async ({ metric, urlHost, urlPath }) => {
    return WebVitalsApi.getPercentileForMetric({ metric, urlHost, urlPath, percentile: 0.75 }).then(res => {
      const cwv = calcCwvMetric(res.percentile_result, metric);
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      setStateMethod(prevState => ({ ...prevState, metric: cwv }));
    })
  };

  const getTimeseriesDataForMetric = async ({ metric, urlHost, urlPath }) => {
    return WebVitalsApi.timeseries({ metric, urlHost, urlPath, percentile: 0.75 }).then(chartData => {
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      const chartDataMod = chartData.map(d => ({ ...d, metric: calcCwvMetric(d.p75, metric) })); 
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartDataMod }));
      setIsFetchingCwvData(false);
    })
  }

  const getDashboardDataForUrlHostAndPath = async (urlHost, urlPath) => {
    setIsFetchingCwvData(true);
    PageViewsAPI.getCount({ urlHost, urlPath }).then(setNumPageViews); 
    return Promise.all([
      getAndSetWebVitalMetric({ metric: 'LCP', urlHost, urlPath }),
      getAndSetWebVitalMetric({ metric: 'INP', urlHost, urlPath }),
      getAndSetWebVitalMetric({ metric: 'CLS', urlHost, urlPath }),
      getAndSetWebVitalMetric({ metric: 'FCP', urlHost, urlPath }),
      getAndSetWebVitalMetric({ metric: 'FID', urlHost, urlPath }),
      getAndSetWebVitalMetric({ metric: 'TTFB', urlHost, urlPath }),
      getTimeseriesDataForMetric({ metric: 'LCP', urlHost, urlPath }),
      getTimeseriesDataForMetric({ metric: 'CLS', urlHost, urlPath }),
      getTimeseriesDataForMetric({ metric: 'INP', urlHost, urlPath }),
      getTimeseriesDataForMetric({ metric: 'FCP', urlHost, urlPath }),
      getTimeseriesDataForMetric({ metric: 'FID', urlHost, urlPath }),
      getTimeseriesDataForMetric({ metric: 'TTFB', urlHost, urlPath }),
    ]).then(() => setIsFetchingCwvData(false))
  }

  if (hasNoData) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="w-full my-6">
          <SnippetInstall projectId={currentProject?.public_id} />
        </div>
      </main>
    )
  } else if (isFetchingCwvData) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 ">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium">Core Web Vitals for {currentProject.name}</h1>
          </div>

          <div className="w-full flex items-center justify-end">
            <HostUrlFilterer onHostSelected={setHostUrlToFilterOn} onNoHostsFound={() => setHasNoData(false) } />
            <div className='inline-block ml-2'>
              {hostUrlToFilterOn && <PathUrlFilterer urlHost={hostUrlToFilterOn}
                                                      onPathSelected={urlPath => {
                                                        setUrlPathToFilterOn(urlPath)
                                                        getDashboardDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)
                                                      }} />}
            </div>
          </div>
        </div>

        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          {[lcp, cls, inp, fcp, fid, ttfb].map(item => (
            <WebVitalCard key={item.key} accronym={item.key} title={item.title} metric={null} timeseriesData={item.timeseriesData} />
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

          <div className="w-full flex items-center justify-end">
            <HostUrlFilterer onHostSelected={setHostUrlToFilterOn} />
            <div className='inline-block ml-2'>
              {hostUrlToFilterOn && <PathUrlFilterer urlHost={hostUrlToFilterOn} 
                                                      onPathSelected={urlPath => {
                                                        setUrlPathToFilterOn(urlPath)
                                                        getDashboardDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)
                                                      }} />}
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
