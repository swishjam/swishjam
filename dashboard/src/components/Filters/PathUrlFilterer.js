'use client';
import { useState, useEffect } from 'react'
import { useAuth } from '@components/AuthProvider';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { FunnelIcon } from '@heroicons/react/24/outline'
import Dropdown from '../Dropdown'

function tryToFindDefaultPath(urlPaths) {
  let autoSelectedPathUrl;
  const pastSelectedPathUrl = localStorage.getItem('swishjamSelectedPathUrl');
  if (urlPaths.find(urlPath => urlPath === pastSelectedPathUrl)) {
    autoSelectedPathUrl = pastSelectedPathUrl;
  } else {
    autoSelectedPathUrl = urlPaths.find(urlPath => urlPath === '/') ||
                            urlPaths.reduce((a, b) => a.length <= b.length ? a : b) ||
                            urlPaths[0];
  }
  return autoSelectedPathUrl;
}

export default function PathUrlFilterer({ urlHost, onPathSelected }) {
  const { currentProject } = useAuth();
  const [filterOptions, setFilterOptions] = useState();
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    if (currentProject) {
      setFilterOptions(undefined);
      PageUrlsApi.getUniquePaths({ urlHost }).then(urlPaths => {
        setFilterOptions(urlPaths);
        const defaultPath = tryToFindDefaultPath(urlPaths);
        if (defaultPath) {
          setSelectedOption(defaultPath);
          onPathSelected(defaultPath);
        }
      });
    }
  }, [currentProject, urlHost]);

  const onDropdownSelection = option => {
    localStorage.setItem('swishjamSelectedPathUrl', option);
    setSelectedOption(option);
    onPathSelected(option);
  }

  return (
    <>
      {filterOptions ? <Dropdown options={filterOptions}
                                    selected={selectedOption}
                                    onSelect={onDropdownSelection}
                                    dropdownIcon={<FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                                    label={'Path URL filter'} /> : (
                                    <div className='flex items-center'>
                                      <div className='h-8 w-12 animate-pulse bg-gray-100 border-gray-400 rounded' />
                                    </div>
                                    )}

    </>
  )
}