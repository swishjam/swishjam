'use client';
import { useState, useEffect } from 'react';
import { BarList, Card, ColGrid, Title, Flex, Text, Bold } from '@tremor/react';
import WebVitalCard from './WebVitalCard';
import { GetCWVData, GetCWVTimeSeriesData, GetNavigationPerformanceEntriesData } from '@lib/api';
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
    metricUnits: '',
    timeseriesData: [{}]
  });
  const [slowPageNavigations, setSlowPageNavigations] = useState();
  
  const getAndSetMetric = async (siteId, cwvKey) => {
    GetCWVData({ siteId: siteId, metric: cwvKey }).then(res => {
      const pData = calcCwvPercent(res.average, cwvMetricBounds[cwvKey].good, cwvMetricBounds[cwvKey].medium );
      const currentCwv = { 'LCP': lcp, 'INP': inp, 'CLS': cls  }[cwvKey];
      const setStateMethod = { 'LCP': setLCP, 'INP': setINP, 'CLS': setCLS }[cwvKey];
      
      let metric;
      
      if(currentCwv.metricUnits === 's') {
        metric = msToSeconds(res.average)
      } else if(currentCwv.metricUnits === 'ms') {
        metric = Number.parseInt(res.average)
      } else {
        metric = Number.parseFloat(res.average).toFixed(4);
      }
      setStateMethod(prevState => ({ ...prevState, metric, bounds: pData.bounds, metricPercent: pData.percent }));
    })
  };

  const getTimeseriesDataForMetric = (siteId, metric) => {
    GetCWVTimeSeriesData({ siteId, metric }).then(chartData => {
      const setStateMethod = { 'LCP': setLCP, 'INP': setINP, 'CLS': setCLS }[metric];
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartData }));
    })
  }

  const getSlowPageNavigations = siteId => {
    GetNavigationPerformanceEntriesData({ siteId, metric: 'dom_interactive' }).then(res => {
      const formatted = res.records.map(item => {
        return {
          ...item,
          href: `/navigation-resources/${window.encodeURIComponent(item.name)}`,
        }
      });
      setSlowPageNavigations(formatted);
    })
  }

  useEffect(() => {
    const siteId = 'sj-syv3hiuj0p51nks5';
    getAndSetMetric(siteId, 'LCP');
    getAndSetMetric(siteId, 'INP');
    getAndSetMetric(siteId, 'CLS');
    getTimeseriesDataForMetric(siteId, 'LCP');
    getTimeseriesDataForMetric(siteId, 'CLS');
    getTimeseriesDataForMetric(siteId, 'INP');
    getSlowPageNavigations(siteId);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-lg font-medium mt-8">Real User Core Web Vitals</h1>

      <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        {[lcp, cls, inp].map(item => (
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
            (<Text>Loading...</Text>) :
            (<BarList data={slowPageNavigations} valueFormatter={value => `${msToSeconds(value)} s`} marginTop='mt-4' color='blue' />)
          }
        </Card>
      </div>
    </main>
  );
}
