'use client'
import { useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall/SnippetInstall';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { PerformanceMetricsApi } from '@/lib/api-client/performance-metrics';
import { PageViewsAPI } from '@/lib/api-client/page-views';
import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import { cwvMetricBounds } from '@/lib/cwvCalculations';
import { formattedMsOrSeconds, metricFormatterPlusUnits } from '@lib/utils';

const MAX_URLS_TO_FETCH = 50;

const loadingSpinner = () => {
  return (
    <div className='flex'>
      <div className='m-auto py-20'>
        <LoadingSpinner size={8} />
      </div>
    </div>
  )
}

const TableRowHeader = ({title, desc}) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  return (
    <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 pl-4">
      {desc ? (<span ref={setTriggerRef}>{title}</span>) : title}
      {visible && (
        <>
          <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
            {desc}
            <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          </div>
        </>
      )}
    </th>
  )
}

const TableRowUrl = ({page}) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  
  const getMetric = (metrics, key) => {
    const metric = metrics.find(m => m.name.toLowerCase() === key.toLowerCase());
    if (metric) return metric.value
    return undefined;
  }

  return (
    <>
    <tr className="px-4" key={page.urlPath}>
      <td className="cursor-default whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8 max-w-xs truncate overflow-hidden">
        {page?.urlPath.length > 60 ? (<span ref={setTriggerRef}>{page.urlPath}</span>) : page.urlPath}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {page.numPageViews.toLocaleString()}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <CwvBadge metric={getMetric(page.pageMetrics, 'LCP')} cwv='LCP' />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <CwvBadge metric={getMetric(page.pageMetrics, 'FID')} cwv='FID' />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <CwvBadge metric={getMetric(page.pageMetrics, 'CLS')} cwv='CLS' />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <CwvBadge metric={getMetric(page.pageMetrics, 'INP')} cwv='INP' />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <CwvBadge metric={getMetric(page.pageMetrics, 'FCP')} cwv='FCP' />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <CwvBadge metric={getMetric(page.pageMetrics, 'TTFB')} cwv='TTFB' />
      </td>
    </tr>
      {
        visible && (
          <>
            <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container text-sm text-gray-700' })}>
              {page.urlPath}
              <div {...getArrowProps({ className: 'tooltip-arrow' })} />
            </div>
          </>
        )
      }
    </>
  ) 
}

const CwvBadge = ({ metric, cwv }) => {
  if(!metric) {return <></>} 
  
  const [colorBg, colorText] = metric <= cwvMetricBounds[cwv].good
                                ? ['bg-green-100', 'text-green-800']
                                : metric <= cwvMetricBounds[cwv].medium
                                  ? ['bg-yellow-100', 'text-yellow-800']
                                  : ['bg-red-100', 'text-red-800'];
  return (
    <span className={`inline-flex rounded-full ${colorBg} ${colorText} px-2 text-xs font-semibold leading-5`}>
      {cwv === 'CLS' ? parseFloat(parseFloat(metric).toFixed(4)) : formattedMsOrSeconds(metric)}
    </span> 
  );
}

const TableData = ({ data = []}) => {
  
  return (
    <div className="mt-8 flow-root">
      <div className="-my-2 -mx-4 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <TableRowHeader title="URL" desc="" />
                <TableRowHeader title="Page Views" desc="" />
                <TableRowHeader title="LCP" desc="Largest Contentful Paint" />
                <TableRowHeader title="FID" desc="First Input Delay" />
                <TableRowHeader title="CLS" desc="Cumulative Layout Shift" />
                <TableRowHeader title="INP" desc="Interaction To Next Paint" />
                <TableRowHeader title="FCP" desc="First Contentful Paint" />
                <TableRowHeader title="TTFB" desc="Time to First Byte" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data ? data.map((page, i) => <TableRowUrl page={page} key={i} />) : loadingSpinner()}
            </tbody>
          </table>
        </div>
      </div>
    </div>    
  )
}

const SkeletonTable = () => {
  return (
    <>
      <TableData data={[]} />
      {Array.from({ length: 10 }).map((_, i) => <div className={`h-12 w-full animate-pulse rounded ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-50'}`} key={i} /> )}
    </>
  )
}

export default function PageBreakdown() {
  const { currentProject } = useAuth();
  const [ urlPathsData, setUrlPathsData ] = useState();
  const [ urlPaths, setUrlPaths ] = useState();

  const onUrlHostSelected = urlHost => {
    setUrlPathsData(undefined);
    PageUrlsApi.getUniquePaths({ urlHosts: [urlHost] }).then(urlPaths => {
      const formattedUrlPaths = urlPaths.map(urlPath => urlPath.url_path);
      setUrlPaths(formattedUrlPaths);
      if (urlPaths) updateViewForHostAndPaths({ urlHost, urlPaths: formattedUrlPaths });
    });
  }

  const updateViewForHostAndPaths = async ({ urlPaths, urlHost }) => {
    setUrlPathsData(undefined);

    const cappedUrlPaths = urlPaths.slice(0, MAX_URLS_TO_FETCH);
   
    const urlsPageViewCountRequests = cappedUrlPaths.map(urlPath => PageViewsAPI.getCount({ urlHost, urlPath }))  
    const urlsPageMetricsRequests = cappedUrlPaths.map(urlPath => PerformanceMetricsApi.getAllMetricsPercentiles({ urlHost, urlPath }))
    const [urlsPageViews, urlsPageMetrics] = await Promise.all([
      Promise.all(urlsPageViewCountRequests), 
      Promise.all(urlsPageMetricsRequests)
    ]);

    const formattedUrlPathsData = cappedUrlPaths.map((urlPath, i) => {
      return {
        urlPath,
        numPageViews: urlsPageViews[i],
        pageMetrics: urlsPageMetrics[i]
      };
    }).sort((a, b) => b.numPageViews - a.numPageViews);   
    
    setUrlPathsData(formattedUrlPathsData);
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Page Performance Breakdown</h1>
          </div>
          <div className='flex justify-end'>
            {<HostUrlFilterer onHostSelected={onUrlHostSelected} onNoHostsFound={() => {}} />}
          </div>
        </div>

        <div className="w-full my-6">
          {urlPathsData === undefined 
              ? (
                <div className='rounded-lg border border-gray-200 p-4'>
                  <SkeletonTable />
                </div>
              )
              : urlPaths.length === 0 
                ? <SnippetInstall projectId={currentProject?.public_id} /> 
                : (
                  <div className='rounded-lg border border-gray-200 p-4'>
                    <TableData data={urlPathsData}/>
                  </div>
                )
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}