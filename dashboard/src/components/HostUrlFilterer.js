'use client';
import { useState } from 'react'
import { FunnelIcon } from '@heroicons/react/24/outline'
import Dropdown from './Dropdown'

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
                            urlHosts.find(urlHost => !urlHost.include('localhost')) ||
                            urlHosts[0];
  }
  return autoSelectedHostUrl;
}

export default function HostUrlFilterer({ options, selectedHost, onHostSelected }) {
  const [selectedOption, setSelectedOption] = useState(selectedHost);

  if (!selectedOption) {
    const defaultHost = tryToFindDefaultHost(options);
    if (defaultHost) {
      setSelectedOption(defaultHost);
      onHostSelected(defaultHost);
    }
  }

  const onDropdownSelection = option => {
    localStorage.setItem('swishjamSelectedHostUrl', option);
    setSelectedOption(option);
    onHostSelected(option);
  }

  return (
    <Dropdown options={options} 
                selected={selectedOption} 
                onSelect={onDropdownSelection} 
                dropdownIcon={<FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                label={'Host URL filter'} />
  )
}