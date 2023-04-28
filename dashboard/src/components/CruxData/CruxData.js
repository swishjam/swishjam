'use client';

import { useState, useEffect } from 'react';
import MarkdownText from '../MarkdownText';
import CruxMetricsGroup from './CruxMetricsGroup';
import NoDataCruxMetricsGroup from './NoDataCruxMetricsGroup';
import { cwvMetricBounds } from '@/lib/cwvCalculations';
import { formattedMsOrSeconds } from '@/lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

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

const getCruxData = async (url, formFactor) => {
  const body = {
    url,
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

  console.log(`Getting ${url} for ${formFactor}...`)
  return fetch("https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=" + CRUX_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
}

export default function CruxData({ url, onLighthouseAuditNavigation, shouldPromptUserToRegister = true }) {
  const [cruxDesktopData, setCruxDesktopData] = useState();
  const [cruxMobileData, setCruxMobileData] = useState();
  const [expandedMetrics, setExpandedMetrics] = useState([]);
  const [isMissingCruxData, setIsMissingCruxData] = useState(false);

  const hostname = url && new URL(url).hostname;
  const path = url && new URL(url).pathname;
  const friendlyUrl = url && `${hostname}${path === '/' ? '' : path}`

  const getAndSetCruxData = async formFactor => {
    if (!url) return;
    setIsMissingCruxData(false);
    setCruxDesktopData();
    setCruxMobileData();

    getCruxData(url, formFactor)
      .then(res => res.json())
      .then(({ error, record }) => {
        if (error) {
          setIsMissingCruxData(true);
        } else {
          return formFactor === 'DESKTOP' ? setCruxDesktopData(record) : setCruxMobileData(record)
        }
      });
  }

  useEffect(() => {
    getAndSetCruxData('DESKTOP')
    getAndSetCruxData('PHONE')
  }, [url]);

  return (
    <div>
      {isMissingCruxData && <div className='bg-yellow-100 text-gray-600 text-left rounded px-8 py-4 text-md mb-4 flex'>
        <ExclamationCircleIcon className='w-6 h-6 mr-2 inline-block' />
        <div>
          <span className='block text-md font-md'>
            {friendlyUrl} does not meet the criteria for Chrome's real user performance data.
          </span>
          {shouldPromptUserToRegister && (
            <>
              <span className='block text-sm mb-2'>
                Consider signing up for a <a href='https://app.swishjam.com' target='_blank' className='underline'>Swishjam account</a> and installing our JS snippet to monitor your real user performance data.
              </span>
              <span className='block text-sm'>
                <span className='cursor-pointer underline' onClick={onLighthouseAuditNavigation}>View Lighthouse Audit</span> in the meantime.
              </span>
            </>
          )}
        </div>
      </div>}
      <div className='grid grid-cols-10 space-y-4'>
        {[
          { metric: "largest_contentful_paint", name: "Largest Contentful Paint", description: 'LCP reports the render time of the largest content element that is visible within the viewport. [web.dev/lcp](https://web.dev/lcp)' },
          { metric: "cumulative_layout_shift", name: "Cumulative Layout Shift", description: 'CLS measures the sum total of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page. [web.dev/cls](https://web.dev/cls)' },
          { metric: "first_input_delay", name: "First Input Delay", description: 'FID measures the time from when a user first interacts with a page (i.e. when they click a link, tap on a button, or use a custom, JavaScript-powered control) to the time when the browser is actually able to respond to that interaction. [web.dev/fid](https://web.dev/fid)' },
          { metric: "first_contentful_paint", name: "First Contentful Paint", description: '' },
          { metric: "experimental_time_to_first_byte", name: "Time to First Byte", description: '' },
          { metric: "experimental_interaction_to_next_paint", name: "Interaction to Next Paint", description: '' },
        ].map(({ metric, name, description }) => (
          <div className='col-span-10 p-4' key={metric}>
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
                  {isMissingCruxData ? <></> : expandedMetrics.includes(metric) ? 'Hide historical data' : 'View historical data'}
                </span>
              </div>
            </div>
            <div className='text-xs text-gray-700'>
              <MarkdownText text={description} />
            </div>
            <div className='w-fit'>
              <div className='inline-flex items-center m-2 ml-0'>
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
                {isMissingCruxData
                  ? <NoDataCruxMetricsGroup 
                      friendlyUrl={friendlyUrl} 
                      onLighthouseAuditNavigation={onLighthouseAuditNavigation} 
                      shouldPromptUserToRegister={shouldPromptUserToRegister}
                    />
                  : cruxDesktopData && cruxMobileData  
                    ? <CruxMetricsGroup
                      metric={metric}
                      timeperiods={cruxDesktopData.collectionPeriods}
                      histogramTimeseriesData={cruxDesktopData.metrics[metric].histogramTimeseries}
                      p75TimeseriesData={cruxDesktopData.metrics[metric].percentilesTimeseries.p75s}
                      maxYValue={Math.max(...cruxDesktopData.metrics[metric].percentilesTimeseries.p75s, ...cruxMobileData.metrics[metric].percentilesTimeseries.p75s)}
                      isExpanded={expandedMetrics.includes(metric)}
                    />
                    : (
                      <>
                        <div className='w-[90%] m-auto bg-gray-300 animate-pulse rounded h-32 ml-[10%] mb-2' />
                        <div className='w-[90%] m-auto bg-gray-300 animate-pulse rounded h-10 ml-[10%]' />
                      </>
                    )
                }
              </div>
              <div>
                <div className='block'>
                  <div className='w-[10%] inline-block'></div>
                  <div className='w-[90%] inline-block'>
                    <span className='text-sm font-medium text-gray-700'>Mobile</span>
                  </div>
                </div>
                {isMissingCruxData
                  ? <NoDataCruxMetricsGroup 
                      friendlyUrl={friendlyUrl} 
                      onLighthouseAuditNavigation={onLighthouseAuditNavigation} 
                      shouldPromptUserToRegister={shouldPromptUserToRegister}
                    />
                  : cruxDesktopData && cruxMobileData  
                    ? <CruxMetricsGroup 
                      metric={metric}
                      timeperiods={cruxMobileData.collectionPeriods} 
                      histogramTimeseriesData={cruxMobileData.metrics[metric].histogramTimeseries} 
                      p75TimeseriesData={cruxMobileData.metrics[metric].percentilesTimeseries.p75s}
                      maxYValue={Math.max(...cruxDesktopData.metrics[metric].percentilesTimeseries.p75s, ...cruxMobileData.metrics[metric].percentilesTimeseries.p75s)}
                      isExpanded={expandedMetrics.includes(metric)}
                    /> 
                    : (
                      <>
                        <div className='w-[90%] m-auto bg-gray-300 animate-pulse rounded h-32 ml-[10%] mb-2' />
                        <div className='w-[90%] m-auto bg-gray-300 animate-pulse rounded h-10 ml-[10%]' />
                      </>
                    )
                }
              </div>
            </div>
            <div className='mt-6 border-t w-full'></div>
          </div>
        ))}
      </div>
      <p className='mt-4 text-center text-gray-300 text-sm font-medium'>This data is collected anonymously from the Chrome UX Report</p>
    </div>
  );
}