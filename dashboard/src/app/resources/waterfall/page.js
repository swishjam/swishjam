'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall';

import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { ResourcePerformanceEntriesApi } from '@/lib/api-client/resource-performance-entries';
import { PerformanceMetricsApi } from '@/lib/api-client/performance-metrics';
import { NavigationPerformanceEntriesApi } from '@/lib/api-client/navigation-performance-entries';
import { LargestContentfulPaintEntriesApi } from '@/lib/api-client/largest-contentful-paint-entries';
import { PageViewsAPI } from '@/lib/api-client/page-views';

import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/HostUrlFilterer';
import Dropdown from '@/components/Dropdown';
import Waterfall from '@/components/ResourceWaterfall/Waterfall';
import WaterfallSkeleton from '@/components/ResourceWaterfall/WaterfallSkeleton';

const loadingSpinner = () => {
  return (
    <div className='flex'>
      <div className='m-auto py-20'>
        <LoadingSpinner size={8} />
      </div>
    </div>
  )
}

export default function Resources() {
  const { currentProject } = useAuth();
  const [hostUrlFilterOptions, setHostUrlFilterOptions] = useState();
  const [pathsForCurrentProjectAndHost, setPathsForCurrentProjectAndHost] = useState();

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [urlPathToFilterOn, setUrlPathToFilterOn] = useState();

  const [numPageViews, setNumPageViews] = useState();

  const [resources, setResources] = useState();
  const [navigationPerformanceEntries, setNavigationPerformanceEntries] = useState();
  const [performanceMetricsValues, setPerformanceMetricsValues] = useState();
  const [largestContentfulPaintEntries, setLargestContentfulPaintEntries] = useState();

  const resetData = () => {
    setNavigationPerformanceEntries(undefined);
    setPerformanceMetricsValues(undefined);
    setLargestContentfulPaintEntries(undefined);
    setResources(undefined);
    setNumPageViews(undefined);
  }

  const onUrlHostSelected = urlHost => {
    setHostUrlToFilterOn(urlHost);
    setUrlPathToFilterOn(undefined);
    resetData();
    PageUrlsApi.getUniquePaths({ urlHosts: [urlHost] }).then(urlPaths => {
      setPathsForCurrentProjectAndHost(urlPaths);
      const urlPath = urlPaths.find(path => path === '/') || urlPaths[0];
      if (urlPath) updateViewForHostAndPath({ urlHost, urlPath });
    });
  }

  const initializeUrlHostFilter = () => {
    setHostUrlFilterOptions(undefined);
    setPathsForCurrentProjectAndHost(undefined);
    setHostUrlToFilterOn(undefined);
    setUrlPathToFilterOn(undefined);
    resetData();
    return PageUrlsApi.getUniqueHosts().then(urlHosts => setHostUrlFilterOptions(urlHosts));
  }

  const updateViewForHostAndPath = ({ urlPath, urlHost }) => {
    setUrlPathToFilterOn(urlPath);
    resetData();
    PageViewsAPI.getCount({ urlHost, urlPath }).then(numPageViews => {
      setNumPageViews(numPageViews);
      const minimumOccurrences = parseFloat(numPageViews) * 0.1; // resource must be present in 10% of page views
      ResourcePerformanceEntriesApi.getAll({ urlHost, urlPath, minimumOccurrences }).then(setResources);
      PerformanceMetricsApi.getAllMetricsPercentiles({ urlHost, urlPath }).then(setPerformanceMetricsValues);
      NavigationPerformanceEntriesApi.getPercentiles({ urlHost, urlPath }).then(setNavigationPerformanceEntries);
      LargestContentfulPaintEntriesApi.getPercentiles({ urlHost, urlPath }).then(setLargestContentfulPaintEntries);
    });
  }

  useEffect(() => {
    if (!currentProject) return;
    initializeUrlHostFilter();
  }, [currentProject]);

  const waterfallLegend = <>
    <div className='flex text-end float-end mb-5 w-fit rounded border border-gray-300 p-3 right-0'>
      <div className='mr-4 text-left'>
        <span className='text-gray-900 text-sm'>Page load metrics:</span>
        {[
          { metric: 'Largest Contenful Paint', bgClass: 'bg-red-700' },
          { metric: 'Time to First Byte', bgClass: 'bg-blue-600' },
          { metric: 'First Contentful Paint', bgClass: 'bg-green-600' },
          { metric: 'DOM Complete', bgClass: 'bg-purple-700' },
          { metric: 'DOM Content Loaded', bgClass: 'bg-orange-300' },
          { metric: 'DOM Interactive', bgClass: 'bg-pink-400' },
          { metric: 'Load', bgClass: 'bg-yellow-700' },
        ].map(legendItem => {
          return (
            <div className='flex items-center' key={legendItem.metric}>
              <div className={`inline-block mr-1 h-3 w-3 rounded ${legendItem.bgClass}`} />
              <span className='text-gray-700 text-sm'>{legendItem.metric}</span>
            </div>
          )
        })}
      </div>
      <div className='text-left'>
        <span className='text-gray-900 text-sm'>Page resources:</span>
        {[
          { metric: 'Javascript Resource', bgClass: 'bg-blue-300' },
          { metric: 'Stylesheet Resource', bgClass: 'bg-green-300' },
          { metric: 'Image Resource', bgClass: 'bg-yellow-300' },
          { metric: 'Fetch/HTTP Request', bgClass: 'bg-purple-300' },
        ].map(legendItem => {
          return (
            <div className='flex items-center' key={legendItem.metric}>
              <div className={`inline-block mr-1 h-3 w-3 rounded ${legendItem.bgClass}`} />
              <span className='text-gray-700 text-sm'>{legendItem.metric}</span>
            </div>
          )
        })}
      </div>
    </div>
  </>

  const hasAllWaterfallData = () => {
    return largestContentfulPaintEntries !== undefined && 
            navigationPerformanceEntries !== undefined && 
            performanceMetricsValues !== undefined && 
            resources !== undefined;
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Page Resource Waterfall</h1>
          </div>
          <div className='w-full text-end'>
            {hostUrlFilterOptions &&
              hostUrlFilterOptions.length > 0 &&
              <HostUrlFilterer options={hostUrlFilterOptions}
                                selectedHost={hostUrlToFilterOn}
                                onHostSelected={onUrlHostSelected} />}
          </div>
        </div>

        <div className="w-full my-6">
          {hostUrlFilterOptions === undefined ? loadingSpinner() :
            hostUrlFilterOptions.length === 0 ? <SnippetInstall projectId={currentProject?.public_id} /> :
            <div className='rounded-lg border border-gray-200 p-4'>
              <div className="flex flex-row items-center justify-between mb-6">
                <div>
                  <div className='block'>
                    <h2 className='inline text-gray-700 text-lg font-medium'>
                      Resource waterfall for
                    </h2>
                    <div className='inline-flex ml-2'>
                      {pathsForCurrentProjectAndHost && <Dropdown options={pathsForCurrentProjectAndHost}
                                                                    selected={urlPathToFilterOn}
                                                                    label={'URL path filter'}
                                                                    direction='right'
                                                                    onSelect={urlPath => updateViewForHostAndPath({ urlHost: hostUrlToFilterOn, urlPath })} />}
                    </div>
                  </div>
                  <div className='block'>
                    <h3 className='text-gray-700 text-sm'>
                      Based on {numPageViews === undefined ? 
                                  (<div className='animate-pulse inline-block w-4 h-4' style={{ marginBottom: '-2px' }}>
                                    <div className='rounded bg-slate-200 w-full h-full'></div>
                                  </div>) : numPageViews} page views over the last 7 days.
                    </h3>
                  </div>
                </div>
                {waterfallLegend}
              </div>
              {!hasAllWaterfallData() ? <WaterfallSkeleton /> :
                  resources?.length > 0 ? <Waterfall resources={resources} 
                                                      performanceMetricsValues={performanceMetricsValues} 
                                                      navigationPerformanceEntries={navigationPerformanceEntries} 
                                                      largestContentfulPaintEntries={largestContentfulPaintEntries} /> :
                    <p className='text-center text-gray-700 text-sm'>No resources found for {hostUrlToFilterOn}{urlPathToFilterOn}</p>
                }
            </div>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}