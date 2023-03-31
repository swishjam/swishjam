'use client';
import { useState } from 'react';
import { ColGrid } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import SnippetInstall from '@components/SnippetInstall';
import ExperienceScoreCard from '@/components/WebVitals/ExperienceScoreCard';
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
  const [experienceScoreTimeseriesData, setExperienceScoreTimeseriesData] = useState();
  const [numPageViews, setNumPageViews] = useState();

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [hasNoData, setHasNoData] = useState();

  const resetDashboardData = () => {
    setCwvBarChartData({});
    setCwvPercentileData({});
    setExperienceScoreTimeseriesData();
    setNumPageViews();
  }

  const getAndSetExperienceScoreTimeseriesData = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath, metrics: JSON.stringify(['LCP', 'INP', 'CLS', 'FCP', 'FID', 'TTFB']) };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.getTimeseriesData(params).then(data => {
      let dataWithExperienceScores = {};
      Object.keys(data).forEach(key => {
        dataWithExperienceScores[key] = data[key].map(record => ({ ...record, ...calcCwvMetric(record.value, key) }));
      });
      setExperienceScoreTimeseriesData(dataWithExperienceScores);
    });
  }
  
  const getAndSetWebVitalPercentiles = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath, metrics: JSON.stringify(['LCP', 'INP', 'CLS', 'FCP', 'FID', 'TTFB']), percentile: 0.75 };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.getPercentileForMetrics(params).then(setCwvPercentileData);
  };

  const getAndSetBarChartsData = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath, metrics: JSON.stringify(['LCP', 'INP', 'CLS', 'FCP', 'FID', 'TTFB']) };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return WebVitalsApi.getGoodNeedsImprovementChartData(params).then(setCwvBarChartData);
  }

  const getAndSetNumPageViews = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return PageViewsAPI.getCount(params).then(setNumPageViews);
  }

  const getDashboardDataForUrlHostAndPath = async (urlHost, urlPath) => {
    resetDashboardData();
    return Promise.all([ 
      getAndSetNumPageViews({ urlHost, urlPath }),
      getAndSetBarChartsData({ urlHost, urlPath }), 
      getAndSetWebVitalPercentiles({ urlHost, urlPath }),
      getAndSetExperienceScoreTimeseriesData({ urlHost, urlPath })
    ]);
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
          <ExperienceScoreCard timeseriesData={experienceScoreTimeseriesData} metricPercentiles={cwvPercentileData} numPageViews={numPageViews} />
        </div>

        <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          <WebVitalCard 
            accronym='LCP' 
            title='Largest Contentful Paint' 
            percentileValue={cwvPercentileData.LCP?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.LCP?.num_records}
            barChartData={cwvBarChartData.LCP} 
          />
          <WebVitalCard 
            accronym='CLS' 
            title='Cumulative Layout Shift' 
            percentileValue={cwvPercentileData.CLS?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.CLS?.num_records}
            barChartData={cwvBarChartData.CLS} 
          />
          <WebVitalCard 
            accronym='INP' 
            title='Input to Next Paint' 
            percentileValue={cwvPercentileData.INP?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.INP?.num_records}
            barChartData={cwvBarChartData.INP} 
          />
          <WebVitalCard 
            accronym='FCP' 
            title='First Contentful Paint' 
            percentileValue={cwvPercentileData.FCP?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.FCP?.num_records}
            barChartData={cwvBarChartData.FCP} 
          />
          <WebVitalCard 
            accronym='FID' 
            title='First Input Delay' 
            percentileValue={cwvPercentileData.FID?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.FID?.num_records}
            barChartData={cwvBarChartData.FID} 
          />
          <WebVitalCard 
            accronym='TTFB' 
            title='Time to First Byte' 
            percentileValue={cwvPercentileData.TTFB?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.TTFB?.num_records}
            barChartData={cwvBarChartData.TTFB} 
          />
        </ColGrid>
      </main>
    );
  }

}
