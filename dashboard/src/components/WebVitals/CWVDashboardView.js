'use client';
import { useState } from 'react';
import { ColGrid } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import SnippetInstall from '@components/SnippetInstall';
import ExperienceScoreCard from '@components/ExperienceScoreCard';
import WebVitalCard from '@/components/WebVitals/WebVitalCard';
import HostUrlFilterer from '../Filters/HostUrlFilterer';
import { calcCwvMetric } from '@lib/cwvCalculations';
import { PageViewsAPI } from '@/lib/api-client/page-views';
import { WebVitalsApi } from '@/lib/api-client/web-vitals';
import PathUrlFilterer from '../Filters/PathUrlFilterer';

export default function CwvDashboardView() {
  const { currentProject } = useAuth();

  const [cwvBarChartData, setCwvBarChartData] = useState({});
  const [cwvPercentileData, setCwvPercentileData] = useState({});
  const [numPageViews, setNumPageViews] = useState();

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [hasNoData, setHasNoData] = useState();

  const resetDashboardData = () => {
    setCwvBarChartData({});
    setCwvPercentileData({});
  }
  
  const getAndSetWebVitalPercentiles = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath, metrics: JSON.stringify(['LCP', 'INP', 'CLS', 'FCP', 'FID', 'TTFB']), percentile: 0.75 };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.getPercentileForMetrics(params).then(setCwvPercentileData);
  };

  const getBarChartsData = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath, metrics: JSON.stringify(['LCP', 'INP', 'CLS', 'FCP', 'FID', 'TTFB']) };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.goodNeedsWorkBadChartData(params).then(setCwvBarChartData);
  }

  const getDashboardDataForUrlHostAndPath = async (urlHost, urlPath) => {
    resetDashboardData();
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    PageViewsAPI.getCount(params).then(setNumPageViews); 
    return Promise.all([ getBarChartsData({ urlHost, urlPath }), getAndSetWebVitalPercentiles({ urlHost, urlPath }) ]);
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
          {/* <ExperienceScoreCard lcp={lcp} cls={cls} fcp={fcp} fid={fid} pageViews={numPageViews} /> */}
        </div>

        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          <WebVitalCard 
            accronym='LCP' 
            title='Largest Contentful Paint' 
            percentileValue={cwvPercentileData.LCP?.percentile_result} 
            numRecordsInPercentileCalculation={cwvPercentileData.LCP?.num_records}
            barChartData={cwvBarChartData.LCP} 
          />
          <WebVitalCard 
            accronym='CLS' 
            title='Cumulative Layout Shift' 
            percentileValue={cwvPercentileData.CLS?.percentile_result} 
            numRecordsInPercentileCalculation={cwvPercentileData.CLS?.num_records}
            barChartData={cwvBarChartData.CLS} 
          />
          <WebVitalCard 
            accronym='INP' 
            title='Input to Next Paint' 
            percentileValue={cwvPercentileData.INP?.percentile_result} 
            numRecordsInPercentileCalculation={cwvPercentileData.INP?.num_records}
            barChartData={cwvBarChartData.INP} 
          />
          <WebVitalCard 
            accronym='FCP' 
            title='First Contentful Paint' 
            percentileValue={cwvPercentileData.FCP?.percentile_result} 
            numRecordsInPercentileCalculation={cwvPercentileData.FCP?.num_records}
            barChartData={cwvBarChartData.FCP} 
          />
          <WebVitalCard 
            accronym='FID' 
            title='First Input Delay' 
            percentileValue={cwvPercentileData.FID?.percentile_result} 
            numRecordsInPercentileCalculation={cwvPercentileData.FID?.num_records}
            barChartData={cwvBarChartData.FID} 
          />
          <WebVitalCard 
            accronym='TTFB' 
            title='Time to First Byte' 
            percentileValue={cwvPercentileData.TTFB?.percentile_result} 
            numRecordsInPercentileCalculation={cwvPercentileData.TTFB?.num_records}
            barChartData={cwvBarChartData.TTFB} 
          />
        </ColGrid>
      </main>
    );
  }

}
