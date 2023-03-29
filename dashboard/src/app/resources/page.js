'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall';
import { BarList, Card, Title } from '@tremor/react';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { ResourcePerformanceEntriesApi } from '@/lib/api-client/resource-performance-entries';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import LoadingSpinner from '@/components/LoadingSpinner';
import { bytesToHumanFileSize } from '@/lib/utils';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import Dropdown from '@/components/Dropdown';

const RESOURCE_INITIATOR_OPTIONS = ['script', 'link', 'img', 'css', 'fetch', 'xmlhttprequest', 'other'];

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
  const [metricToFilterOn, setMetricToFilterOn] = useState('duration');
  const [resourceInitiatorTypesToFilterOn, setResourceInitiatorTypesToFilterOn] = useState(RESOURCE_INITIATOR_OPTIONS);
  
  const [resourceDataIsBeingFetched, setResourceDataIsBeingFetched] = useState(false);
  const [resources, setResources] = useState();

  const onUrlHostSelected = urlHost => {
    setResourceDataIsBeingFetched(true);
    setHostUrlToFilterOn(urlHost);
    setUrlPathToFilterOn(undefined);
    PageUrlsApi.getUniquePaths({ urlHosts: [urlHost] }).then(urlPaths => {
      setPathsForCurrentProjectAndHost(urlPaths);
      const urlPath = urlPaths.find(path => path === '/') || urlPaths[0];
      if(urlPath) updateViewForHostAndPath({ urlHost, urlPath });
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

  const fetchResourcesAndRenderView = ({ urlHost, urlPath, metric, initiatorTypes }) => {
    setResourceDataIsBeingFetched(true);
    ResourcePerformanceEntriesApi.getAll({ urlHost, urlPath, metric, initiatorTypes }).then(resources => {
      setResources(resources);
      setResourceDataIsBeingFetched(false);
    });
  }

  const updateViewForHostAndPath = ({ urlPath, urlHost }) => {
    setUrlPathToFilterOn(urlPath);
    const metricColumnName = metricToFilterOn === 'duration' ? 'duration' : 'transfer_size';
    fetchResourcesAndRenderView({ urlHost, urlPath, metric: metricColumnName, initiatorTypes: resourceInitiatorTypesToFilterOn });
  }

  const updateViewForMetric = newMetric => {
    setMetricToFilterOn(newMetric);
    const metricColumnName = newMetric === 'duration' ? 'duration' : 'transfer_size';
    fetchResourcesAndRenderView({ 
      urlHost: hostUrlToFilterOn, 
      urlPath: urlPathToFilterOn, 
      metric: metricColumnName, 
      initiatorTypes: resourceInitiatorTypesToFilterOn 
    });
  }

  const updateViewForResourceInitiatorTypes = newResourceInitiatorTypesToFilterOn => {
    setResourceInitiatorTypesToFilterOn(newResourceInitiatorTypesToFilterOn);
    const metricColumnName = metricToFilterOn === 'duration' ? 'duration' : 'transfer_size';
    fetchResourcesAndRenderView({ 
      urlHost: hostUrlToFilterOn,
      urlPath: urlPathToFilterOn,
      metric: metricColumnName, 
      initiatorTypes: newResourceInitiatorTypesToFilterOn 
    });
  }

  const valueFormatter = (value) => {
    if (metricToFilterOn === 'duration') {
      return value >= 1_000 ? `${parseFloat(value/1_000).toFixed(2)} s` : `${parseFloat(value).toFixed(2)} ms`;
    } else {
      return bytesToHumanFileSize(value);
    }
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
            <h1 className="text-lg font-medium">Page Resources</h1>
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
            <div className="flex flex-row justify-between items-center mb-6">
              <div>
                <h2 className='inline text-gray-700 text-lg font-medium'>
                  {metricToFilterOn === 'duration' ? 'Slowest' : 'Largest'} resources on 
                </h2>
                <div className='inline-flex ml-2'>
                  {pathsForCurrentProjectAndHost && <Dropdown options={pathsForCurrentProjectAndHost} 
                                                              selected={urlPathToFilterOn} 
                                                              label={'URL path filter'}
                                                              onSelect={urlPath => updateViewForHostAndPath({ urlHost: hostUrlToFilterOn, urlPath })} />}
                </div>
              </div>
              <div>
                <div className='inline-flex items-center'>
                  {pathsForCurrentProjectAndHost && (
                    <>
                      <MultiSelectDropdown options={RESOURCE_INITIATOR_OPTIONS.map( type => ({ name: type, value: type }) )} 
                                            selectedOptions={resourceInitiatorTypesToFilterOn.map( type => ({ name: type, value: type }) )}
                                            onChange={updateViewForResourceInitiatorTypes} />
                      <div className='ml-4'>
                        <Dropdown options={['duration', 'size']} selected={metricToFilterOn} label={'Metric'} onSelect={metric => updateViewForMetric(metric)} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {resourceDataIsBeingFetched ? loadingSpinner() : 
                !resources || resources.length === 0 ? <p className='text-center text-gray-700 text-sm'>No resources found for {hostUrlToFilterOn}{urlPathToFilterOn}</p> : 
                  <BarList data={resources} valueFormatter={valueFormatter} />}
          </Card>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}