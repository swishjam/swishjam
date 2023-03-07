'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall';
import { BarList, Card, Title, Text } from '@tremor/react';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { ResourcePerformanceEntriesApi } from '@/lib/api-client/resource-performance-entries';
import SearchableDropdownSelector from '@/components/SearchableDropdownSelector';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import LoadingSpinner from '@/components/LoadingSpinner';
import { bytesToHumanFileSize } from '@/lib/utils';
import HostUrlFilterer from '@/components/HostUrlFilterer';

const RESOURCE_INITIATOR_OPTIONS = ['script', 'link', 'img', 'css', 'fetch', 'xmlhttprequest', 'other'];

export default function Resources() {
  const { currentProject } = useAuth();
  const [hostUrlFilterOptions, setHostUrlFilterOptions] = useState();
  const [pathsForCurrentProjectAndHost, setPathsForCurrentProjectAndHost] = useState();
  
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [urlPathToFilterOn, setUrlPathToFilterOn] = useState();
  const [metricToFilterOn, setMetricToFilterOn] = useState('duration');
  const [resourceInitiatorTypesToFilterOn, setResourceInitiatorTypesToFilterOn] = useState(RESOURCE_INITIATOR_OPTIONS);
  
  const [resources, setResources] = useState();

  const onUrlHostSelected = urlHost => {
    localStorage.setItem('swishjamSelectedHostUrl', urlHost);
    setHostUrlToFilterOn(urlHost);
    setUrlPathToFilterOn(null);
    PageUrlsApi.getUniquePaths({ urlHosts: [urlHost] }).then(urlPaths => {
      setPathsForCurrentProjectAndHost(urlPaths);
      const urlPath = urlPaths[0];
      if(urlPath) updateViewForHostAndPath({ urlHost, urlPath });
    });
  }

  const setupUrlHostFilter = () => {
    return PageUrlsApi.getUniqueHosts().then(urlHosts => {
      setHostUrlFilterOptions(urlHosts);
      if (!hostUrlToFilterOn) {
        let autoSelectedHostUrl;
        const pastSelectedHostUrl = localStorage.getItem('swishjamSelectedHostUrl');
        if (urlHosts.find(urlHost => urlHost === pastSelectedHostUrl)) {
          autoSelectedHostUrl = pastSelectedHostUrl;
        } else {
          autoSelectedHostUrl = urlHosts.find(urlHost => urlHost.includes('www.')) ||
                                  urlHosts.find(urlHost => urlHost.includes('.com')) ||
                                  urlHosts.find(urlHost => urlHost.includes('https://')) ||
                                  urlHosts.find(urlHost => !urlHost.include('localhost')) ||
                                  urlHosts[0];
        }
        onUrlHostSelected(autoSelectedHostUrl);
      }
    });
  }

  const fetchResourcesAndRenderView = ({ urlHost, urlPath, metric, initiatorTypes }) => {
    ResourcePerformanceEntriesApi.getAll({ urlHost, urlPath, metric, initiatorTypes }).then(resources => {
      const formatted = resources.map(record => ({ ...record, href: `/resources/${encodeURIComponent(record.name)}` }))
      setResources(formatted);
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
    fetchResourcesAndRenderView({ urlHost, urlPath, metric: metricColumnName, initiatorTypes: resourceInitiatorTypesToFilterOn });
  }

  const updateViewForResourceInitiatorTypes = newResourceInitiatorTypesToFilterOn => {
    setResourceInitiatorTypesToFilterOn(newResourceInitiatorTypesToFilterOn);
    const metricColumnName = metricToFilterOn === 'duration' ? 'duration' : 'transfer_size';
    fetchResourcesAndRenderView({ urlHost, urlPath, metric: metricColumnName, initiatorTypes: newResourceInitiatorTypesToFilterOn });
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
    setupUrlHostFilter();
  }, [currentProject]);

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Page Resources</h1>
          </div>
          <div className='w-full text-end'>  
            {hostUrlFilterOptions && <HostUrlFilterer options={hostUrlFilterOptions} 
                                                        selectedHost={hostUrlToFilterOn} 
                                                        onHostSelected={onUrlHostSelected} />}
          </div>
        </div>

        <div className="w-full my-6">
        {pathsForCurrentProjectAndHost === undefined ? <LoadingSpinner /> :
            pathsForCurrentProjectAndHost.length === 0 ? <SnippetInstall projectId={currentProject?.public_id} /> : 
          <Card>
            <div className="flex flex-row justify-between items-center mb-6">
              <Title>
                {urlPathToFilterOn === 'duration' ? 'Slowest' : 'Largest'} resources on 
                <div className='inline-flex'>
                  {pathsForCurrentProjectAndHost ? <SearchableDropdownSelector options={pathsForCurrentProjectAndHost} 
                                                                                onSelect={urlPath => updateViewForHostAndPath({ urlHost: hostUrlToFilterOn, urlPath })} /> : 
                                                    <LoadingSpinner />}
                </div>
              </Title>
              <div>  
                {pathsForCurrentProjectAndHost ? (
                  <>
                    <MultiSelectDropdown options={RESOURCE_INITIATOR_OPTIONS.map( type => ({ name: type, value: type }) )} 
                                          selectedOptions={resourceInitiatorTypesToFilterOn.map( type => ({ name: type, value: type }) )}
                                          onChange={updateViewForResourceInitiatorTypes} />
                    <SearchableDropdownSelector options={['duration', 'size']} onSelect={metric => updateViewForMetric(metric)} />
                  </>
                ) : <LoadingSpinner />}
              </div>
            </div>
            {resources === undefined ? <LoadingSpinner /> : 
                resources.length === 0 ? <p className='text-center text-gray-700 text-sm'>No resources found for {hostUrlToFilterOn}{urlPathToFilterOn}</p> : 
                  <BarList data={resources} valueFormatter={valueFormatter} />}
          </Card>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}