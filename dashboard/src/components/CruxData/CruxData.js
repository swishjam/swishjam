'use client';

import { useState, useEffect } from 'react';
import MarkdownText from '../MarkdownText';
import CruxMetricsGroup from './CruxMetricsGroup';
import { cwvMetricBounds } from '@/lib/cwvCalculations';
import { formattedMsOrSeconds } from '@/lib/utils';
const CRUX_API_KEY = 'AIzaSyD3DF2QoXzxsafuVFgJIfeJMXSqTSDuLrw';

const cwvBoundsForMetric = metric => {
  return cwvMetricBounds[{
    'first_contentful_paint': 'FCP',
    'first_input_delay': 'FID',
    'largest_contentful_paint': 'LCP',
    'cumulative_layout_shift': 'CLS',
    'experimental_time_to_first_byte': 'TTFB',
    'experimental_interaction_to_next_paint': 'INP',
  }[metric]]
}

export default function CruxData({ url, onLighthouseAuditNavigation }) {
  const [cruxDesktopData, setCruxDesktopData] = useState();
  const [cruxMobileData, setCruxMobileData] = useState();
  const [expandedMetrics, setExpandedMetrics] = useState([]);
  const [cruxError, setCruxError] = useState();
  const [urlForCruxData, setUrlForCruxData] = useState(url);

  const getAndSetCruxData = async ({ url, formFactor }) => {
    setCruxError();
    setCruxDesktopData();
    setCruxMobileData();
    const body = {
      url: url,
      formFactor,
      metrics: [
        "first_contentful_paint",
        "first_input_delay",
        "largest_contentful_paint",
        "cumulative_layout_shift",
        "experimental_time_to_first_byte",
        "experimental_interaction_to_next_paint"
      ]
    }

    return fetch("https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=" + CRUX_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(({ error, record }) => {
      if (error) {
        setCruxError(error.message);
      } else {
        return formFactor === 'DESKTOP' ? setCruxDesktopData(record) : setCruxMobileData(record)
      }
    });
  }

  useEffect(() => {
    getAndSetCruxData({ url: urlForCruxData, formFactor: 'DESKTOP' })
    getAndSetCruxData({ url: urlForCruxData, formFactor: 'PHONE' })
  }, []);

  return (
    <div>
      {cruxError && <div className='border-red-600 bg-red-100 text-red-600 text-center p-4 text-md'>
        <span className='block'>Unable to display real user data for {urlForCruxData}</span>
        <span className='block cursor-pointer underline' onClick={onLighthouseAuditNavigation}>View Lighthouse Audit.</span>
      </div>}
      {!cruxError && (
        <div className='grid grid-cols-10 space-y-4'>
          {[
            { metric: "largest_contentful_paint", name: "Largest Contentful Paint", description: 'LCP reports the render time of the largest content element that is visible within the viewport. [web.dev/lcp](web.dev/lcp)' },
            { metric: "cumulative_layout_shift", name: "Cumulative Layout Shift", description: 'CLS measures the sum total of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page. [web.dev/cls](web.dev/cls)' },
            { metric: "first_input_delay", name: "First Input Delay", description: 'FID measures the time from when a user first interacts with a page (i.e. when they click a link, tap on a button, or use a custom, JavaScript-powered control) to the time when the browser is actually able to respond to that interaction. [web.dev/fid](web.dev/fid)' },
            { metric: "first_contentful_paint", name: "First Contentful Paint", description: '' },
            { metric: "experimental_time_to_first_byte", name: "Time to First Byte", description: '' },
            { metric: "experimental_interaction_to_next_paint", name: "Interaction to Next Paint", description: '' },
          ].map(({ metric, name, description }) => (
            <div className='col-span-10 border border-gray-200 rounded bg-gray-100 p-4' key={metric}>
              <div className='grid grid-cols-2'>
                <h3 className='text-md text-gray-900 mb-2'>{name}</h3>
                <div className='text-end'>
                  <span
                    className='text-sm font-light text-gray-700 decoration-dotted hover:underline cursor-pointer'
                    onClick={() => {
                      if (expandedMetrics.includes(metric)) {
                        setExpandedMetrics(expandedMetrics.filter(m => m !== metric))
                      } else {
                        setExpandedMetrics([...expandedMetrics, metric])
                      }
                    }}
                  >
                    {expandedMetrics.includes(metric) ? 'Hide historical data' : 'View historical data'}
                  </span>
                </div>
              </div>
              <p className='text-xs text-gray-600'><MarkdownText text={description} /></p>
              <div className='w-fit'>
                <div className='inline-flex items-center m-2'>
                  <div className='w-6 h-4 bg-green-500 rounded inline-block' />
                  <span className='text-xs text-gray-600 ml-2'>
                    Good ({'<'} {metric === 'cumulative_layout_shift' ? cwvBoundsForMetric(metric).good : formattedMsOrSeconds(cwvBoundsForMetric(metric).good)})
                  </span>
                </div>
                <div className='inline-flex items-center m-2'>
                  <div className='w-6 h-4 bg-yellow-400 rounded inline-block' />
                  <span className='text-xs text-gray-600 ml-2'>
                    Needs Improvement 
                  </span>
                </div>
                <div className='inline-flex items-center m-2'>
                  <div className='w-6 h-4 bg-red-500 rounded inline-block' />
                  <span className='text-xs text-gray-600 ml-2'>
                    Poor ({'>='} {metric === 'cumulative_layout_shift' ? cwvBoundsForMetric(metric).medium : formattedMsOrSeconds(cwvBoundsForMetric(metric).medium)})
                  </span>
                </div>
              </div>
              <div className='grid grid-cols-2 mt-4'>
                <div>
                  <div className='block'>
                    <div className='w-[10%] inline-block'></div>
                    <div className='w-[90%] inline-block'>
                      <span className='block text-sm font-medium text-gray-700'>Desktop</span>
                    </div>
                  </div>
                  {cruxDesktopData  ? <CruxMetricsGroup
                    metric={metric}
                    timeperiods={cruxDesktopData.collectionPeriods}
                    histogramTimeseriesData={cruxDesktopData.metrics[metric].histogramTimeseries}
                    p75TimeseriesData={cruxDesktopData.metrics[metric].percentilesTimeseries.p75s}
                    isExpanded={expandedMetrics.includes(metric)}
                  /> : <div className='w-[90%] m-auto bg-gray-300 animate-pulse rounded h-10 ml-[10%]' />}
                </div>
                <div>
                  <div className='block'>
                    <div className='w-[10%] inline-block'></div>
                    <div className='w-[90%] inline-block'>
                      <span className='text-sm font-medium text-gray-700'>Mobile</span>
                    </div>
                  </div>
                  {cruxMobileData ? <CruxMetricsGroup 
                    metric={metric}
                    timeperiods={cruxMobileData.collectionPeriods} 
                    histogramTimeseriesData={cruxMobileData.metrics[metric].histogramTimeseries} 
                    p75TimeseriesData={cruxMobileData.metrics[metric].percentilesTimeseries.p75s}
                    isExpanded={expandedMetrics.includes(metric)}
                  /> : <div className='w-[90%] m-auto bg-gray-300 animate-pulse rounded h-10 ml-[10%]' />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}