'use client';

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView";
import DetailsHeader from "@/components/LabTests/DetailsHeader";
import { formattedMsOrSeconds } from "@/lib/utils";
import { WebPageTestResults } from "@/lib/web-page-test-results-parser";
import LighthouseScore from "@/components/WebPageTest/LighthouseScore";
import Filmstrip from "@/components/WebPageTest/Filmstrip";

const GOOD_NEEDS_IMPROVEMENT_POOR_TIERS = {
  LargestContentfulPaint: {
    good: 2_500,
    needsImprovement: 4_000
  },
  TotalBlockingTime: {
    good: 300,
    needsImprovement: 600
  },
  FirstInputDelay: {
    good: 100,
    needsImprovement: 300
  },
  CumulativeLayoutShift: {
    good: 0.1,
    needsImprovement: 0.25
  },
  SpeedIndex: {
    good: 1_000,
    needsImprovement: 3_000
  },
  TimeToFirstByte: {
    good: 800,
    needsImprovement: 1_800
  }
}

export default function Overview({ params }) {
  const { id } = params;
  const [webPageTestResults, setWebPageTestResults] = useState();

  useEffect(() => {
    fetch(`https://www.webpagetest.org/jsonResult.php?test=${id}&breakdown=${1}`)
      .then((res) => res.json())
      .then(async response => {
        if (response.statusCode === 200 && response.data?.median?.firstView?.requests) {
          setWebPageTestResults(new WebPageTestResults(response))
        } else {
          // an error occurred!;
        }
      });
  }, [])

  return (
    <AuthenticatedView>
      <DetailsHeader webPageTestResults={webPageTestResults} selectedNavItem='Overview' labTestId={id} />
      <div className='my-2'>
        <div className='text-center'>
          <span className='block text-lg font-medium text-gray-700'>Lighthouse Performance Score</span>
          {webPageTestResults
            ? <LighthouseScore score={webPageTestResults.lighthouseScore()} size='medium' />
            : <div className='h-24 w-24 animate-pulse bg-gray-200 rounded-full mt-2 m-auto' />
          }
        </div>
        <Filmstrip 
          filmstrip={webPageTestResults?.filmstrip()} 
          performanceMetrics={{
            LargestContentfulPaint: webPageTestResults?.performanceData().LargestContentfulPaint,
            FirstContentfulPaint: webPageTestResults?.performanceData().firstContentfulPaint,
            TimeToFirstByte: webPageTestResults?.performanceData().TimeToFirstByte,
          }} 
        />
        <div className='grid grid-cols-3 gap-4'>
          {[
            ['Largest Contentful Paint', 'LargestContentfulPaint'],
            ['Total Blocking Time', 'TotalBlockingTime'],
            ['First Input Delay', 'FirstInputDelay'],
            ['Cumulative Layout Shift', 'CumulativeLayoutShift'],
            ['Speed Index', 'SpeedIndex'],
            ['Time to First Byte', 'TimeToFirstByte']
          ].map(([title, metric]) => {
            const val = webPageTestResults?.performanceData()[metric];
            const color = val < GOOD_NEEDS_IMPROVEMENT_POOR_TIERS[metric].good ? 'text-green-600' : val < GOOD_NEEDS_IMPROVEMENT_POOR_TIERS[metric].needsImprovement ? 'text-yellow-600' : 'text-red-600';
            return (
              <div className='bg-white rounded-lg shadow-md border border-gray-100 px-4 py-8' key={metric}>
                <h3 className='text-sm text-gray-500'>{title}</h3>
                {webPageTestResults 
                  ? <h1 className={`text-4xl font-bold ${color}`}>{metric === 'CumulativeLayoutShift' ? parseFloat(val).toFixed(4) : formattedMsOrSeconds(val)}</h1>
                  : <div className='h-10 w-24 animate-pulse bg-gray-200 rounded mt-2' />}
              </div>
            )
          })}
        </div>
      </div>
    </AuthenticatedView>
  )
}