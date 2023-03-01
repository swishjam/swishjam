'use client';
import { useState, useEffect } from 'react';
import { Card, ColGrid } from '@tremor/react';
import WebVitalCard from './WebVitalCard';
import { GetData, GetTimeSeriesData } from '@lib/api';
import { msToSeconds, cwvMetricBounds, calcCwvPercent } from '@lib/utils';

export default function DashboardView() {
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
    metricUnits: 's',
    timeseriesData: [{}]
  });
  
  const getAndSetMetric = async (siteId, cwvKey) => {
    GetData({ siteId: siteId, metric: cwvKey }).then(res => {
      const pData = calcCwvPercent(res.average, cwvMetricBounds[cwvKey].good, cwvMetricBounds[cwvKey].medium );
      const setStateMethod = {
        'LCP': setLCP,
        'INP': setINP,
        'CLS': setCLS
      }[cwvKey]
      setStateMethod(prevState => ({
        ...prevState,
        metric: res.average,
        bounds: pData.bounds,
        metricPercent: pData.percent
      }));
    })
  };

  const getTimeseriesDataForMetric = (siteId, metric) => {
    GetTimeSeriesData({ siteId, metric }).then(chartData => {
      const setStateMethod = {
        'LCP': setLCP,
        'INP': setINP,
        'CLS': setCLS
      };
      setStateMethod[metric](prevState => ({ ...prevState, timeseriesData: chartData }));
    })
  }

  useEffect(() => {
    const siteId = 'sj-55a4ab9cebf9d45f'
    getAndSetMetric(siteId, 'LCP');
    getTimeseriesDataForMetric(siteId, 'LCP');
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-lg font-medium mt-8">Real User Core Web Vitals</h1>

      <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        {[lcp, cls, inp].map(item => (
          <WebVitalCard
            key={item.key}
            title={item.title}
            metric={msToSeconds(item.metric)}
            metricUnits={item.metricUnits}
            metricPercent={item.metricPercent}
            bounds={item.bounds}
            timeseriesData={item.timeseriesData}
          />
        ))}
      </ColGrid>

      <div className="w-full my-6">
        <Card>
          <div className="h-80" />
        </Card>
      </div>
    </main>
  );
}
