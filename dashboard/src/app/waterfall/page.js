'use client'
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall/SnippetInstall';

import { ResourcePerformanceEntriesApi } from '@/lib/api-client/resource-performance-entries';
import { PerformanceMetricsApi } from '@/lib/api-client/performance-metrics';
import { NavigationPerformanceEntriesApi } from '@/lib/api-client/navigation-performance-entries';
import { LargestContentfulPaintEntriesApi } from '@/lib/api-client/largest-contentful-paint-entries';
import { PageViewsAPI } from '@/lib/api-client/page-views';

import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import Waterfall from '@/components/ResourceWaterfall/Waterfall';
import WaterfallSkeleton from '@/components/ResourceWaterfall/WaterfallSkeleton';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';
import Legend from '@/components/ResourceWaterfall/Legend';

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

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [hasData, setHasData] = useState();
  
  const [resources, setResources] = useState();
  const [navigationPerformanceEntries, setNavigationPerformanceEntries] = useState();
  const [performanceMetricsValues, setPerformanceMetricsValues] = useState();
  const [largestContentfulPaintEntries, setLargestContentfulPaintEntries] = useState();
  const [numPageViews, setNumPageViews] = useState();
  
  const resetData = () => {
    setNavigationPerformanceEntries(undefined);
    setPerformanceMetricsValues(undefined);
    setLargestContentfulPaintEntries(undefined);
    setResources(undefined);
    setNumPageViews(undefined);
  }

  const updateViewForHostAndPath = ({ urlPath, urlHost }) => {
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
            <h3 className='text-gray-700 text-sm'>
              Based on {numPageViews === undefined ?
                (<div className='animate-pulse inline-block w-4 h-4' style={{ marginBottom: '-2px' }}>
                  <div className='rounded bg-slate-200 w-full h-full'></div>
                </div>) : numPageViews} page views over the last 7 days.
            </h3>
          </div>
          <div className='w-full flex items-center justify-end'>
            {<HostUrlFilterer onNoHostsFound={() => setHasData(false)}
                              onHostSelected={urlHost => {
                                setHostUrlToFilterOn(urlHost);
                                setHasData(true);
                              }} />}
            <div className='ml-2 inline-block'>
              {<PathUrlFilterer 
                  urlHost={hostUrlToFilterOn} 
                  onPathSelected={urlPath => updateViewForHostAndPath({ urlHost: hostUrlToFilterOn, urlPath }) } 
                />}
            </div>
          </div>
        </div>

        <div className="w-full my-6">
          {hostUrlToFilterOn === undefined && hasData === undefined ? loadingSpinner() :
            !hasData ? <SnippetInstall projectId={currentProject?.public_id} /> :
            <div className='rounded-lg border border-gray-200 p-4'>
              <Legend />
              {!hasAllWaterfallData() ? <WaterfallSkeleton /> :
                  resources?.length > 0 ? <Waterfall resources={resources} 
                                                      performanceMetricsValues={performanceMetricsValues} 
                                                      navigationPerformanceEntries={navigationPerformanceEntries} 
                                                      largestContentfulPaintEntries={largestContentfulPaintEntries} /> :
                    <p className='text-center text-gray-700 text-sm'>No resources found for URL</p>
                }
            </div>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}