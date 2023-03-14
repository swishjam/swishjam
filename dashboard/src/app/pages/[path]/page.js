'use client';
import AuthenticatedView from '@/components/AuthenticatedView';
import { BarList, Card, Title, Flex, Text, Bold, ColGrid } from '@tremor/react';
import { useEffect, useState } from "react";
import { msToSeconds } from "@/lib/utils";
import { cwvMetricBounds, calcCwvPercent } from '@/lib/cwvCalculations';
// import { GetResourcePerformanceEntries, GetCWVData, GetCWVTimeSeriesData } from "@/lib/api";
import { WebVitalsApi } from '@/lib/api-client/web-vitals';
import WebVitalCard from '@/components/WebVitalCard';

export default function NavigationResource({ params }) {
  const { path: encodedPath } = params;
  const decodedPath = decodeURIComponent(encodedPath);

  const [resources, setResources] = useState();
  const [lcp, setLCP] = useState({ key: "LCP", title: "Largest Contentful Paint Average", metric: null, metricUnits: 's', timeseriesData: [{}] });
  const [inp, setINP] = useState({ key: "INP", title: "Interaction to Next Paint Average", metric: null, metricUnits: 's', timeseriesData: [{}] });
  const [cls, setCLS] = useState({ key: "CLS", title: "Cumulative Layout Shift Average", metric: null, metricUnits: '', timeseriesData: [{}] });
  const [fcp, setFCP] = useState({ key: "FCP", title: "First Contentful Paint Average", metric: null, metricUnits: 's', timeseriesData: [{}] });
  const [fid, setFID] = useState({ key: "FID", title: "First Input Delay Average", metric: null, metricUnits: 's', timeseriesData: [{}] });
  const [ttfb, setTTFB] = useState({ key: "TTFB", title: "Time to First Byte Average", metric: null, metricUnits: 's', timeseriesData: [{}] });

  const getAndSetWebVitalMetric = async (siteId, cwvKey) => {
    WebVitalsApi.average({ siteId, metric: cwvKey, urlPath: encodedPath }).then(res => {
      const pData = calcCwvPercent(res.average, cwvMetricBounds[cwvKey].good, cwvMetricBounds[cwvKey].medium);
      const currentCwv = { LCP: lcp, INP: inp, CLS: cls, FCP: fcp, FID: fid, TTFB: ttfb }[cwvKey];
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[cwvKey];
      const metric = res.average === null  ? 'N/A' : 
                      currentCwv.metricUnits === 's' ? msToSeconds(res.average) :
                        currentCwv.metricUnits === 'ms' ? parseInt(res.average) : parseFloat(res.average).toFixed(4);
      setStateMethod(prevState => ({ ...prevState, metric, bounds: pData.bounds, metricPercent: pData.percent }));
    })
  };

  const getTimeseriesDataForMetric = async (siteId, metric) => {
    WebVitalsApi.timeseries({ siteId, metric, urlPath: encodedPath }).then(chartData => {
      const setStateMethod = { LCP: setLCP, INP: setINP, CLS: setCLS, FCP: setFCP, FID: setFID, TTFB: setTTFB }[metric];
      setStateMethod(prevState => ({ ...prevState, timeseriesData: chartData }));
    })
  };

  useEffect(() => {
    GetResourcePerformanceEntries({ urlPath: encodedPath, siteId: 'sj-syv3hiuj0p51nks5' }).then(res => {
      const formatted = res.records.map(record => ({ ...record, href: `/resources/${encodeURIComponent(record.name)}` }))
      setResources(formatted)
    });
    
    const siteId = 'sj-syv3hiuj0p51nks5';
    getAndSetWebVitalMetric(siteId, 'LCP');
    getAndSetWebVitalMetric(siteId, 'INP');
    getAndSetWebVitalMetric(siteId, 'CLS');
    getAndSetWebVitalMetric(siteId, 'FCP');
    getAndSetWebVitalMetric(siteId, 'FID');
    getAndSetWebVitalMetric(siteId, 'TTFB');
    getTimeseriesDataForMetric(siteId, 'LCP');
    getTimeseriesDataForMetric(siteId, 'CLS');
    getTimeseriesDataForMetric(siteId, 'INP');
    getTimeseriesDataForMetric(siteId, 'FCP');
    getTimeseriesDataForMetric(siteId, 'FID');
    getTimeseriesDataForMetric(siteId, 'TTFB');
  }, []);

  return (
    <>
      <AuthenticatedView>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
          <h1 className="text-lg font-medium mt-8">Web Vitals for "{decodedPath}"</h1>
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
                shouldLinkToCwvDetails={false}
              />
            ))}
          </ColGrid>
          <div className="my-6">
            <Card>
              <Title>Slowest resources on "{decodedPath}"</Title>
              <Flex marginTop="mt-4">
                <Text><Bold>Slowest resources</Bold></Text>
                <Text><Bold>Average duration</Bold></Text>
              </Flex>
              {resources === undefined ? 
                <Text>Loading...</Text> :
                <BarList data={resources} valueFormatter={value => `${msToSeconds(value)} s`} marginTop='mt-4' color='blue' />
              }
            </Card>
          </div>
        </main>
      </AuthenticatedView>
    </>
  );
}