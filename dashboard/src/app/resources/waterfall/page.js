'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall';
import { Card } from '@tremor/react';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { ResourcePerformanceEntriesApi } from '@/lib/api-client/resource-performance-entries';
import { PerformanceMetricsApi } from '@/lib/api-client/performance-metrics';
import LoadingSpinner from '@/components/LoadingSpinner';
import HostUrlFilterer from '@/components/HostUrlFilterer';
import Dropdown from '@/components/Dropdown';
import Waterfall from '@/components/ResourceWaterfall/Waterfall';

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

  const [resourceDataIsBeingFetched, setResourceDataIsBeingFetched] = useState(false);
  const [resources, setResources] = useState();
  const [performanceMetricsAverages, setPerformanceMetricsAverages] = useState();

  const onUrlHostSelected = urlHost => {
    setResourceDataIsBeingFetched(true);
    setHostUrlToFilterOn(urlHost);
    setUrlPathToFilterOn(undefined);
    PageUrlsApi.getUniquePaths({ urlHosts: [urlHost] }).then(urlPaths => {
      setPathsForCurrentProjectAndHost(urlPaths);
      const urlPath = urlPaths.find(path => path === '/') || urlPaths[0];
      if (urlPath) updateViewForHostAndPath({ urlHost, urlPath });
    });
  }

  const initializeUrlHostFilter = () => {
    setResourceDataIsBeingFetched(true);
    setHostUrlFilterOptions(undefined);
    setPathsForCurrentProjectAndHost(undefined);
    setHostUrlToFilterOn(undefined);
    setUrlPathToFilterOn(undefined);
    return PageUrlsApi.getUniqueHosts().then(urlHosts => setHostUrlFilterOptions(urlHosts));
  }

  const fetchResourcesAndRenderView = ({ urlHost, urlPath, initiatorTypes }) => {
    setResourceDataIsBeingFetched(true);
    ResourcePerformanceEntriesApi.getAll({ urlHost, urlPath, initiatorTypes }).then(resources => {
      setResources(resources);
      setResourceDataIsBeingFetched(false);
    });
    PerformanceMetricsApi.getAllAverages({ urlHost, urlPath }).then(setPerformanceMetricsAverages);
  }

  const updateViewForHostAndPath = ({ urlPath, urlHost }) => {
    setUrlPathToFilterOn(urlPath);
    fetchResourcesAndRenderView({ urlHost, urlPath });
  }

  useEffect(() => {
    if (!currentProject) return;
    initializeUrlHostFilter();
  }, [currentProject]);

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
              <Card>
                <div className="flex flex-row justify-between mb-6">
                  <div>
                    <h2 className='inline text-gray-700 text-lg font-medium'>
                      Resource waterfall for
                    </h2>
                    <div className='inline-flex ml-2'>
                      {pathsForCurrentProjectAndHost && <Dropdown options={pathsForCurrentProjectAndHost}
                                                                    selected={urlPathToFilterOn}
                                                                    label={'URL path filter'}
                                                                    onSelect={urlPath => updateViewForHostAndPath({ urlHost: hostUrlToFilterOn, urlPath })} />}
                    </div>
                  </div>
                  <div className='flex text-end float-end mb-5 w-fit rounded border border-gray-300 p-3 right-0'>
                    <div className='mr-4 text-left'>
                      <span className='text-gray-900 text-sm'>Page load metrics legend:</span>
                      {[
                        { metric: 'Largest Contenful Paint', bgClass: 'bg-red-700' },
                        { metric: 'Time to First Byte', bgClass: 'bg-blue-600' },
                        { metric: 'First Contentful Paint', bgClass: 'bg-green-600' },
                      ].map(legendItem => {
                        return (
                          <div className='flex items-center'>
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
                          <div className='flex items-center'>
                            <div className={`inline-block mr-1 h-3 w-3 rounded ${legendItem.bgClass}`} />
                            <span className='text-gray-700 text-sm'>{legendItem.metric}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                {resourceDataIsBeingFetched ? loadingSpinner() :
                  resources?.length > 0 ? <Waterfall resources={resources} performanceMetricsAverages={performanceMetricsAverages} /> : 
                                          <p className='text-center text-gray-700 text-sm'>No resources found for {hostUrlToFilterOn}{urlPathToFilterOn}</p>
                    }
              </Card>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}