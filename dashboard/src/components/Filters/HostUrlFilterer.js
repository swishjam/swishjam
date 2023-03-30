'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@components/AuthProvider';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { FunnelIcon } from '@heroicons/react/24/outline';
import Dropdown from '../Dropdown';

function tryToFindDefaultHost(urlHosts) {
  let autoSelectedHostUrl;
  const pastSelectedHostUrl = localStorage.getItem('swishjamSelectedHostUrl');
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

export default function HostUrlFilterer({ onHostSelected, onNoHostsFound }) {
  const { currentProject } = useAuth();
  const [filterOptions, setFilterOptions] = useState();
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    if (currentProject) {
      PageUrlsApi.getUniqueHosts().then(urlHosts => {
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
  }, [currentProject]);

  const onDropdownSelection = option => {
    localStorage.setItem('swishjamSelectedHostUrl', option);
    setSelectedOption(option);
    onHostSelected(option);
  }

  return (
    filterOptions ? <Dropdown options={filterOptions}
                                selected={selectedOption}
                                onSelect={onDropdownSelection}
                                dropdownIcon={<FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                                label={'Host URL filter'} /> : (
                                  <div className='flex items-center'>
                                    <div className='h-10 w-24 animate-pulse bg-gray-50 border border-gray-400 rounded-md' />
                                  </div>
                                )
  )
}