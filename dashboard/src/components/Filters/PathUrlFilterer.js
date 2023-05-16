'use client';
import { useState, useEffect } from 'react'
import { useAuth } from '@components/AuthProvider';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { FunnelIcon } from '@heroicons/react/24/outline'
import Dropdown from '../Dropdown'
import { ProjectPageUrlsAPI } from '@/lib/api-client/project-page-urls';
import { SwishjamMemory } from '@/lib/swishjam-memory';

function tryToFindDefaultPath(urlPaths) {
  let autoSelectedPathUrl;
  const pastSelectedPathUrl = SwishjamMemory.get('selectedPathUrlFilter');
  if (urlPaths.find(urlPath => urlPath === pastSelectedPathUrl)) {
    autoSelectedPathUrl = pastSelectedPathUrl;
  } else {
    autoSelectedPathUrl = urlPaths.find(urlPath => urlPath === '/') ||
                            (urlPaths?.length > 0 && urlPaths.reduce((a, b) => a.length <= b.length ? a : b)) ||
                            urlPaths[0];
  }
  return autoSelectedPathUrl;
}

export default function PathUrlFilterer({ urlHost, onPathSelected, disabled, includeAllPathsSelection = false, urlPathAPI = 'rum' }) {
  if (!['rum', 'lab'].includes(urlPathAPI)) throw new Error('urlHostAPI must be rum or lab');
  const UrlPathAPIInterface = { rum: PageUrlsApi, lab: ProjectPageUrlsAPI }[urlPathAPI];
  const { currentProject } = useAuth();
  const [filterOptions, setFilterOptions] = useState();
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    if (currentProject && urlHost) {
      setFilterOptions(undefined);
      UrlPathAPIInterface.getUniquePaths({ urlHost }).then(urlPaths => {
        if (includeAllPathsSelection) urlPaths.unshift('All Paths');
        setFilterOptions(urlPaths);
        const defaultPath = tryToFindDefaultPath(urlPaths);
        if (defaultPath) {
          setSelectedOption(defaultPath);
          onPathSelected(defaultPath);
        }
      });
    }
  }, [currentProject?.public_id, urlHost]);

  const onDropdownSelection = option => {
    SwishjamMemory.set('selectedPathUrlFilter', option);
    setSelectedOption(option);
    onPathSelected(option);
  }

  return (
    <>
      {filterOptions && urlHost && !disabled
        ? (
        <Dropdown options={filterOptions}
          selected={selectedOption}
          onSelect={onDropdownSelection}
          dropdownIcon={<FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
          label={'Path URL filter'} />
        ) : (
          <div className='flex items-center'>
            <div className={`h-10 w-20 rounded-md border ${disabled ? 'bg-gray-200 border-gray-400' : 'animate-pulse bg-gray-50 border-gray-200'}`} />
          </div>
        )
      }

    </>
  )
}