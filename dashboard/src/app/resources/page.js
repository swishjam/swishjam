'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthenticatedView from "@/components/AuthenticatedView";
import SnippetInstall from '@/components/SnippetInstall';
import { BarList, Card, Title } from '@tremor/react';
import { GetUrlsForCurrentProject, GetResourcePerformanceEntries } from '@lib/api';
import SearchableDropdownSelector from '@/components/SearchableDropdownSelector';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import LoadingSpinner from '@/components/LoadingSpinner';
import { bytesToHumanFileSize } from '@/lib/utils';

const RESOURCE_INITIATOR_OPTIONS = ['script', 'link', 'img', 'css', 'fetch', 'xmlhttprequest', 'other'];

export default function Resources() {
  const { currentProject } = useAuth();
  const [currentUrlHostAndPath, setCurrentUrlHostAndPath] = useState();
  const [urlsForCurrentProject, setUrlsForCurrentProject] = useState();
  const [resources, setResources] = useState();
  const [metric, setMetric] = useState('duration');
  const [resourceInitiatorTypes, setResourceInitiatorTypes] = useState(RESOURCE_INITIATOR_OPTIONS);

  const updateViewForUrlHostAndPath = urlHostAndPath => {
    setCurrentUrlHostAndPath(urlHostAndPath);
    const metricColumnName = metric === 'duration' ? 'duration' : 'transfer_size';
    GetResourcePerformanceEntries({ 
      urlHostAndPath, 
      metric: metricColumnName,
      initiatorTypes: resourceInitiatorTypes 
    }).then(res => {
      const formatted = res.records.map(record => ({ ...record, href: `/resources/${encodeURIComponent(record.name)}` }))
      setResources(formatted);
    });
  }

  const updateViewForMetric = metric => {
    setMetric(metric);
    const metricColumnName = metric === 'duration' ? 'duration' : 'transfer_size';
    GetResourcePerformanceEntries({ 
      urlHostAndPath: currentUrlHostAndPath, 
      metric: metricColumnName,
      initiatorTypes: resourceInitiatorTypes
    }).then(res => {
      const formatted = res.records.map(record => ({ ...record, href: `/resources/${encodeURIComponent(record.name)}` }))
      setResources(formatted);
    });
  }

  const updateViewForResourceInitiatorTypes = resourceInitiatorTypes => {
    setResourceInitiatorTypes(resourceInitiatorTypes);
    const metricColumnName = metric === 'duration' ? 'duration' : 'transfer_size';
    GetResourcePerformanceEntries({ 
      urlHostAndPath: currentUrlHostAndPath, 
      metric: metricColumnName, 
      initiatorTypes: resourceInitiatorTypes 
    }).then(res => {
      const formatted = res.records.map(record => ({ ...record, href: `/resources/${encodeURIComponent(record.name)}` }))
      setResources(formatted);
    });
  }

  const valueFormatter = (value) => {
    if (metric === 'duration') {
      return value >= 1_000 ? `${parseFloat(value/1_000).toFixed(2)} s` : `${parseFloat(value).toFixed(2)} ms`;
    } else {
      return bytesToHumanFileSize(value);
    }
  }

  useEffect(() => {
    GetUrlsForCurrentProject().then(urls => {
      setUrlsForCurrentProject(urls.map(url => url.url_host_and_path));
      if(urls.length > 0) updateViewForUrlHostAndPath(urls[0].url_host_and_path);
    });
  }, [currentProject]);

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
        <h1 className="text-lg font-medium mt-8">Page Resources</h1>

        <div className="w-full my-6">
        {urlsForCurrentProject === undefined ? <LoadingSpinner /> :
          urlsForCurrentProject.length === 0 ? <SnippetInstall projectId={currentProject?.public_id} /> : 
          <Card>
            <div className="flex flex-row justify-between items-center mb-6">
              <Title>
                {metric === 'duration' ? 'Slowest' : 'Largest'} resources on 
                <div className='inline-flex'>
                  {currentUrlHostAndPath ? <SearchableDropdownSelector options={urlsForCurrentProject} onSelect={updateViewForUrlHostAndPath} /> : <LoadingSpinner />}
                </div>
              </Title>
              <div>  
                {urlsForCurrentProject ? (
                  <>
                    <MultiSelectDropdown options={RESOURCE_INITIATOR_OPTIONS.map( type => ({ name: type, value: type }) )} 
                                          selectedOptions={resourceInitiatorTypes.map( type => ({ name: type, value: type }) )}
                                          onChange={updateViewForResourceInitiatorTypes} />
                    <SearchableDropdownSelector options={['duration', 'size']} onSelect={updateViewForMetric} />
                  </>
                ) : <LoadingSpinner />}
              </div>
            </div>
            {resources ? <BarList data={resources} valueFormatter={valueFormatter} /> : <LoadingSpinner />}
          </Card>
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}