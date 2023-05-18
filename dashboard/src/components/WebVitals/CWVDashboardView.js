'use client';

import { useState, useEffect } from 'react';
import { ColGrid } from '@tremor/react';
import { useAuth } from '@components/AuthProvider';
import SnippetInstall from '@components/SnippetInstall/SnippetInstall';
import ExperienceScoreCard from '@/components/WebVitals/ExperienceScoreCard';
import WebVitalCard from '@/components/WebVitals/WebVitalCard';
// import HostUrlFilterer from '@components/Filters/HostUrlFilterer';
import { calcCwvMetric } from '@lib/cwvCalculations';
import { PageViewsAPI } from '@/lib/api-client/page-views';
import { WebVitalsApi } from '@/lib/api-client/web-vitals';
// import PathUrlFilterer from '../Filters/PathUrlFilterer';

export default function CwvDashboardView({ urlHost, urlPath, hasNoData }) {
  const { currentProject, isAwaitingData } = useAuth();

  const [cwvBarChartData, setCwvBarChartData] = useState({});
  const [cwvPercentileData, setCwvPercentileData] = useState({});
  const [experienceScoreTimeseriesData, setExperienceScoreTimeseriesData] = useState();
  const [numPageViews, setNumPageViews] = useState();

  useEffect(() => {
    const fetchData = async () => {
      resetDashboardData();
      return await Promise.all([
        getAndSetNumPageViews({ urlHost, urlPath }),
        getAndSetBarChartsData({ urlHost, urlPath }),
        getAndSetWebVitalPercentiles({ urlHost, urlPath }),
      ]);
    }
    if (urlHost) fetchData();
  }, [urlHost, urlPath])

  const resetDashboardData = () => {
    setCwvBarChartData({});
    setCwvPercentileData({});
    setExperienceScoreTimeseriesData();
    setNumPageViews();
  }

  const getAndSetExperienceScoreTimeseriesData = async ({ urlHost, urlPath, groupBy = 'day' }) => {
    const params = { urlHost, urlPath, groupBy, metrics: JSON.stringify(['LCP', 'INP', 'CLS', 'FCP', 'FID', 'TTFB']) };
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
    return WebVitalsApi.getGoodNeedsImprovementChartData(params).then(({ data, groupedBy }) => {
      setCwvBarChartData(data);
      getAndSetExperienceScoreTimeseriesData({ urlHost, urlPath, groupBy: groupedBy });
    });
  }

  const getAndSetNumPageViews = async ({ urlHost, urlPath }) => {
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    return PageViewsAPI.getCount(params).then(setNumPageViews);
  }

  if (hasNoData) {
    return (
      <div className="w-full my-6">
        <SnippetInstall projectId={currentProject?.public_id} />
      </div>
    )
  } else {
    return (
      <>
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
            accronym='FID'
            title='First Input Delay'
            percentileValue={cwvPercentileData.FID?.value}
            numRecordsInPercentileCalculation={cwvPercentileData.FID?.num_records}
            barChartData={cwvBarChartData.FID}
          />
          <WebVitalCard 
            accronym='INP' 
            title='Interaction to Next Paint' 
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
            accronym='TTFB' 
            title='Time to First Byte' 
            percentileValue={cwvPercentileData.TTFB?.value} 
            numRecordsInPercentileCalculation={cwvPercentileData.TTFB?.num_records}
            barChartData={cwvBarChartData.TTFB} 
          />
        </ColGrid>
      </>
    );
  }

}
