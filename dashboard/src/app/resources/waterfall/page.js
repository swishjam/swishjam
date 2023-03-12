'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { ResourcePerformanceEntriesApi } from '@/lib/api-client/resource-performance-entries';
import { PerformanceMetricsApi } from '@/lib/api-client/performance-metrics';
import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/HostUrlFilterer';
import Dropdown from '@/components/Dropdown';
import Waterfall from '@/components/ResourceWaterfall/Waterfall';
import WaterfallSkeleton from '@/components/ResourceWaterfall/WaterfallSkeleton';
import NavigationPerformanceEntriesApi from '@/lib/api-client/navigation-performance-entries';
import { LargestContentfulPaintEntriesApi } from '@/lib/api-client/largest-contentful-paint-entries';

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

  const [resources, setResources] = useState();
  const [navigationPerformanceEntriesAverages, setNavigationPerformanceEntriesAverages] = useState();
  const [performanceMetricsAverages, setPerformanceMetricsAverages] = useState();
  const [largestContentfulPaintEntriesAverages, setLargestContentfulPaintEntriesAverages] = useState();

  const onUrlHostSelected = urlHost => {
    setHostUrlToFilterOn(urlHost);
    setUrlPathToFilterOn(undefined);
    setNavigationPerformanceEntriesAverages(undefined);
    setPerformanceMetricsAverages(undefined);
    setResources(undefined);
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
    setNavigationPerformanceEntriesAverages(undefined);
    setPerformanceMetricsAverages(undefined);
    setResources(undefined);
    return PageUrlsApi.getUniqueHosts().then(urlHosts => setHostUrlFilterOptions(urlHosts));
  }

  const updateViewForHostAndPath = ({ urlPath, urlHost }) => {
    setUrlPathToFilterOn(urlPath);
    setNavigationPerformanceEntriesAverages(undefined);
    setPerformanceMetricsAverages(undefined);
    setLargestContentfulPaintEntriesAverages(undefined);
    setResources(undefined);
    ResourcePerformanceEntriesApi.getAll({ urlHost, urlPath }).then(setResources);
    PerformanceMetricsApi.getAllAverages({ urlHost, urlPath }).then(setPerformanceMetricsAverages);
    NavigationPerformanceEntriesApi.getAverages({ urlHost, urlPath }).then(setNavigationPerformanceEntriesAverages);
    LargestContentfulPaintEntriesApi.getDistinctEntries({ urlHost, urlPath }).then(setLargestContentfulPaintEntriesAverages);
  }

  useEffect(() => {
    if (!currentProject) return;
    initializeUrlHostFilter();
  }, [currentProject]);

  const waterfallLegend = <>
    <div className='flex text-end float-end mb-5 w-fit rounded border border-gray-300 p-3 right-0'>
      <div className='mr-4 text-left'>
        <span className='text-gray-900 text-sm'>Page load metrics legend:</span>
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
        <span className='text-gray-900 text-sm'>Page resource legend:</span>
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

  const hasAllData = () => {
    return largestContentfulPaintEntriesAverages !== undefined && 
            navigationPerformanceEntriesAverages !== undefined && 
            performanceMetricsAverages !== undefined && 
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
              <div className="flex flex-row justify-between mb-6">
                <div>
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
                {waterfallLegend}
              </div>
              {!hasAllData() ? <WaterfallSkeleton /> :
                  resources?.length > 0 ? <Waterfall resources={resources} 
                                                      performanceMetricsAverages={performanceMetricsAverages} 
                                                      navigationPerformanceEntriesAverages={navigationPerformanceEntriesAverages} 
                                                      largestContentfulPaintEntriesAverages={largestContentfulPaintEntriesAverages} /> :
                    <p className='text-center text-gray-700 text-sm'>No resources found for {hostUrlToFilterOn}{urlPathToFilterOn}</p>
                }
            </div>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}