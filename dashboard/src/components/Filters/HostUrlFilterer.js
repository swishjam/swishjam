'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@components/AuthProvider';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { ProjectPageUrlsAPI } from '@/lib/api-client/project-page-urls';
import { FunnelIcon } from '@heroicons/react/24/outline';
import Dropdown from '../Dropdown';
import { SwishjamMemory } from '@/lib/swishjam-memory';

function tryToFindDefaultHost(urlHosts) {
  let autoSelectedHostUrl;
  const pastSelectedHostUrl = SwishjamMemory.get('selectedHostUrlFilter');
  if (urlHosts.find(urlHost => urlHost === pastSelectedHostUrl)) {
    autoSelectedHostUrl = pastSelectedHostUrl;
  } else {
    autoSelectedHostUrl = urlHosts.find(urlHost => urlHost.includes('www.')) ||
                            urlHosts.find(urlHost => urlHost.split('.').length === 2 && !urlHost.includes('localhost')) ||
                            urlHosts.find(urlHost => urlHost.includes('.com')) ||
                            urlHosts.find(urlHost => urlHost.includes('https://')) ||
                            urlHosts.find(urlHost => !urlHost.includes('localhost')) ||
                            urlHosts[0];
  }
  return autoSelectedHostUrl;
}

export default function HostUrlFilterer({ onHostSelected, onNoHostsFound, onHostsFetched, disabled, urlHostAPI = 'rum' }) {
  if (!['rum', 'lab'].includes(urlHostAPI)) throw new Error('urlHostAPI must be rum or lab');
  const UrlHostAPIInterface = { rum: PageUrlsApi, lab: ProjectPageUrlsAPI }[urlHostAPI];
  const { currentProject } = useAuth();
  const [filterOptions, setFilterOptions] = useState();
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    if (currentProject) {
      onHostsFetched && onHostsFetched();
      setFilterOptions();
      setSelectedOption();
      UrlHostAPIInterface.getUniqueHosts().then(urlHosts => {
        setFilterOptions(urlHosts);
        const defaultHost = tryToFindDefaultHost(urlHosts);
        if (defaultHost) {
          setSelectedOption(defaultHost);
          onHostSelected(defaultHost);
        } else {
          onNoHostsFound && onNoHostsFound();
        }
      });
    }
  }, [currentProject?.public_id, urlHostAPI]);

  const onDropdownSelection = option => {
    SwishjamMemory.set('selectedHostUrlFilter', option);
    setSelectedOption(option);
    onHostSelected(option);
  }

  return (
    !filterOptions || disabled
      ? (
        <div className='flex items-center'>
          <div className={`h-10 w-24 rounded-md border ${disabled ? 'bg-gray-200 border-gray-400' : 'animate-pulse bg-gray-50 border-gray-200'}`} />
        </div>
      ) : (
        <Dropdown
          options={filterOptions}
          selected={selectedOption}
          onSelect={onDropdownSelection}
          dropdownIcon={<FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
          label='Host URL filter'
        /> 
      )
  )
}