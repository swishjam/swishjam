'use client';
import { useState, useEffect } from 'react';
import { Card, ColGrid } from '@tremor/react';
import WebVitalCard from './WebVitalCard';
import { GetData } from '@lib/api';
import { msToSeconds, cwvMetricBounds } from '@lib/utils';

const sales = [
  {
      Month: 'Jan 21',
      Good: 2890,
      "Needs Improvement": 1200,
      Poor: 400,
  },
  {
      Month: 'Feb 21',
      Good: 2090,
      "Needs Improvement": 2000,
      Poor: 400,
  },
  {
      Month: 'Mar 21',
      Good: 2190,
      "Needs Improvement": 2100,
      Poor: 200,
  },
  {
      Month: 'Apr 21',
      Good: 2690,
      "Needs Improvement": 1600,
      Poor: 200,
  },
  {
      Month: 'May 21',
      Good: 2790,
      "Needs Improvement": 1500,
      Poor: 200,
  },
  {
      Month: 'Jun 21',
      Good: 2890,
      "Needs Improvement": 1400,
      Poor: 200,
  },
  {
      Month: 'Jul 21',
      Good: 2990,
      "Needs Improvement": 1400,
      Poor: 100,
  },
  {
      Month: 'Aug 21',
      Good: 3090,
      "Needs Improvement": 1300,
      Poor: 100,
  },
  {
      Month: 'Sep 21',
      Good: 3190,
      "Needs Improvement": 1200,
      Poor: 100,
  },
  {
      Month: 'Oct 21',
      Good: 3390,
      "Needs Improvement": 1000,
      Poor: 100,
  },
  {
      Month: 'Nov 21',
      Good: 3590,
      "Needs Improvement": 800,
      Poor: 100,
  },
  {
      Month: 'Dec 21',
      Good: 3090,
      "Needs Improvement": 1300,
      Poor: 100,
  },
];

export default function DashboardView() {
  const [ lcp, setLcp ] = useState({
    key: "LCP",
    title: "Largest Contentful Paint Avg",
    // timeseries: sales, 
    metric: '',
    metricUnits: 's',
    bounds: cwvMetricBounds.LCP,
  });
  const [ inp, setInp ] = useState({
    key: "INP",
    title: "Interaction to Next Paint Avg",
    metric: '',
    metricUnits: 's',
    // timeseries: sales, 
    bounds: cwvMetricBounds.INP,
  });
  const [ cls, setCls ] = useState({
    key: "CLS",
    title: "CLS",
    metric: '',
    metricUnits: 's',
    // timeseries: sales, 
    bounds: cwvMetricBounds.CLS,
  });

  const cwv = [
    lcp,
    inp,
    cls,
  ]

  const getAvgAndSet = (metric, setterCallback) => {
    GetData({ siteId: 'sj-55a4ab9cebf9d45f', metric }).then(res => setterCallback(prevState => ({ ...prevState, metric: res.average })) );
  };

  useEffect(() => {
    getAvgAndSet('LCP', setLcp);
    getAvgAndSet('FCP', setInp);
    getAvgAndSet('CLS', setCls);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-lg font-medium mt-8">Real User Core Web Vitals</h1>

      <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        {cwv.map((item, index) => (
          <WebVitalCard 
            key={item.key} 
            accronym={item.key}
            title={item.title} 
            metric={msToSeconds(item.metric)} 
            metricUnits={item.metricUnits} 
            metricPercent={90} 
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
