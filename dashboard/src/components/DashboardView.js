'use client';
import { useState } from 'react';
import {
  Card,
  Metric,
  Text,
  ColGrid,
  Flex,
  Block,
} from '@tremor/react';
import WebVitalCard from './WebVitalCard';

const categories = [
  {
      title: 'First Contentful Paint Avg',
      metric: '9.5',
      percentageValue: 95,
  },
  {
      title: 'Largest Contentful Paint Avg',
      metric: '8.2',
      percentageValue: 82,
  },
  {
      title: 'RABBLE RABBLE',
      metric: '6.8',
      percentageValue: 68,
  },
];

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

/*
          <h2>Welcome!</h2>
          <code className="highlight">{user.role}</code>
          <Link className="button" href="/profile">
            Go to Profile
          </Link>
          <button type="button" className="button-inverse" onClick={signOut}>
            Sign Out
          </button>
        </main>
*/
export default function DashboardView() {
  const item = categories[0]

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
      <h1 className="text-lg font-medium mt-8">Real User Core Web Vitals</h1>

      <ColGrid numColsMd={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        {categories.map((item, index) => (
          <WebVitalCard 
            key={index} 
            title={item.title} 
            metric={item.metric} 
            metricTotal={10} 
            timeseries={sales} 
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
