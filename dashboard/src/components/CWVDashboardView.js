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
  const { currentProject } = useAuth();

  const [lcp, setLCP] = useState(initialCwvState({ key: 'LCP', title: 'Largest Contentful Paint' }));
  const [inp, setINP] = useState(initialCwvState({ key: 'INP', title: 'Interaction to Next Paint' }));
  const [cls, setCLS] = useState(initialCwvState({ key: 'CLS', title: 'Cumulative Layout Shift' }));
  const [fcp, setFCP] = useState(initialCwvState({ key: 'FCP', title: 'First Contentful Paint' }));
  const [fid, setFID] = useState(initialCwvState({ key: 'FID', title: 'First Input Delay' }));
  const [ttfb, setTTFB] = useState(initialCwvState({ key: 'TTFB', title: 'Time to First Byte' }));
  const [numPageViews, setNumPageViews] = useState();

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [hasNoData, setHasNoData] = useState();

  const resetDashboardData = () => {
    setLCP(initialCwvState({ key: 'LCP', title: 'Largest Contentful Paint' }));
    setINP(initialCwvState({ key: 'INP', title: 'Interaction to Next Paint' }));
    setCLS(initialCwvState({ key: 'CLS', title: 'Cumulative Layout Shift' }));
    setFCP(initialCwvState({ key: 'FCP', title: 'First Contentful Paint' }));
    setFID(initialCwvState({ key: 'FID', title: 'First Input Delay' }));
    setTTFB(initialCwvState({ key: 'TTFB', title: 'Time to First Byte' }));
  }
  
  const getAndSetWebVitalMetric = async ({ metric, urlHost, urlPath }) => {
    const params = { metric, urlHost, urlPath, percentile: 0.75 };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.getPercentileForMetric(params).then(res => {
      const cwv = calcCwvMetric(res.percentile_result, metric);
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      setStateMethod(prevState => ({ ...prevState, metric: cwv }));
    })
  };

  const getTimeseriesDataForMetric = async ({ metric, urlHost, urlPath }) => {
    const params = { metric, urlHost, urlPath, percentile: 0.75 };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.timeseries(params).then(chartData => {
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      const chartDataMod = chartData.map(d => ({ ...d, metric: calcCwvMetric(d.p75, metric) })); 
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartDataMod }));
    })
  }

  const getDashboardDataForUrlHostAndPath = async (urlHost, urlPath) => {
    resetDashboardData();
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    PageViewsAPI.getCount(params).then(setNumPageViews); 
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
    ])
  }

  if (hasNoData) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="w-full my-6">
          <SnippetInstall projectId={currentProject?.public_id} />
        </div>
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
            <HostUrlFilterer onNoHostsFound={() => setHasNoData(true)}
                              onHostSelected={hostUrl => {
                                                resetDashboardData();
                                                setHostUrlToFilterOn(hostUrl);
                                              }} />
            <div className='inline-block ml-2'>
              <PathUrlFilterer urlHost={hostUrlToFilterOn} 
                                includeAllPathsSelection={true}
                                onPathSelected={urlPath => getDashboardDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)} />
            </div>
          </div>
        </div>

        <div className='mt-8 flex items-center'>
          <ExperienceScoreCard lcp={lcp} cls={cls} fcp={fcp} fid={fid} pageViews={numPageViews} />
        </div>

        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          {[lcp, cls, inp, fcp, fid, ttfb].map(item => (
            <WebVitalCard key={item.key} accronym={item.key} title={item.title} metric={item.metric} timeseriesData={item.timeseriesData} />
          ))}
        </ColGrid>
      </main>
    );
  }

}
