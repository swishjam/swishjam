'use client';
import { useState, useEffect, Fragment } from 'react'
import { useAuth } from '@components/AuthProvider';
import { PageUrlsApi } from '@/lib/api-client/page-urls';
import { FunnelIcon, CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ProjectPageUrlsAPI } from '@/lib/api-client/project-page-urls';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import { Menu, Transition } from '@headlessui/react';

function tryToFindDefaultPath(urlPaths) {
  let autoSelectedPathUrl;
  const pastSelectedPathUrl = SwishjamMemory.get('selectedPathUrlFilter');
  if (urlPaths.find(({ url_path }) => url_path === pastSelectedPathUrl)) {
    autoSelectedPathUrl = pastSelectedPathUrl;
  } else {
    const autoSelectedPathUrlObject = urlPaths.find(({ url_path }) => url_path === '/') ||
                                      (urlPaths?.length > 0 && urlPaths.reduce((a, b) => a.url_path.length <= b.url_path.length ? a : b)) ||
                                      urlPaths[0];
    autoSelectedPathUrl = autoSelectedPathUrlObject?.url_path;
  }
  return autoSelectedPathUrl;
}

const MAX_NUM_OPTIONS_TO_DISPLAY = 50;

export default function PathUrlFilterer({ urlHost, onPathSelected, disabled, includeAllPathsSelection = false, urlPathAPI = 'rum' }) {
  if (!['rum', 'lab'].includes(urlPathAPI)) throw new Error('urlHostAPI must be rum or lab');
  const UrlPathAPIInterface = { rum: PageUrlsApi, lab: ProjectPageUrlsAPI }[urlPathAPI];
  const { currentProject } = useAuth();
  const [filterOptions, setFilterOptions] = useState();
  const [selectedOption, setSelectedOption] = useState();
  const [searchedOptions, setSearchedOptions] = useState();

  useEffect(() => {
    if (currentProject && urlHost) {
      setFilterOptions(undefined);
      UrlPathAPIInterface.getUniquePaths({ urlHost }).then(urlPaths => {
        if (includeAllPathsSelection) urlPaths.unshift({ url_path: 'All Paths' });
        setFilterOptions(urlPaths);
        setSearchedOptions(urlPaths);
        const defaultPath = tryToFindDefaultPath(urlPaths);
        if (defaultPath) {
          setSelectedOption(defaultPath);
          onPathSelected(defaultPath);
        }
      });
    }
  }, [currentProject?.public_id, urlHost]);

  const onDropdownSelection = urlPath => {
    SwishjamMemory.set('selectedPathUrlFilter', urlPath);
    setSelectedOption(urlPath);
    onPathSelected(urlPath);
  }

  return (
    <>
      {filterOptions && urlHost && !disabled
        ? (
          <PathFilterDropdown 
            onSelect={onDropdownSelection}
            selected={selectedOption}
            onSearch={search => setSearchedOptions(filterOptions.filter(({ url_path }) => url_path.includes(search)))}
            options={
              searchedOptions.slice(0, MAX_NUM_OPTIONS_TO_DISPLAY).map(({ url_path, total_views }) => ({ 
                value: url_path,
                isSelected: url_path === selectedOption,
                text: (
                  <>
                    <span className='text-sm font-medium text-gray-700 truncate'>{url_path}</span>
                    {typeof total_views === 'number' && <span className='text-xs text-white bg-swishjam rounded-lg px-2 py-1'>{total_views}</span>}
                  </>
                ),
              }))
            }
          />
        ) : (
          <div className='flex items-center'>
            <div className={`h-10 w-20 rounded-md border ${disabled ? 'bg-gray-200 border-gray-400' : 'animate-pulse bg-gray-50 border-gray-200'}`} />
          </div>
        )
      }

    </>
  )
}

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const PathFilterDropdown = ({ direction = 'left', options, selected, onSelect, onSearch }) => {
  const [selectedOption, setSelectedOption] = useState(selected);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const directionClass = direction === 'left' ? 'right-0' : 'left-0'

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className='truncate'>{selectedOption || selected}</span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400 mt-1" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`absolute w-96 max-h-screen overflow-y-scroll ${directionClass} z-30 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none cursor-pointer`}>
          <Menu.Item disabled={true}>
            <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 border-b cursor-default flex justify-between items-center">
              <span>URL Path Filter</span>
              <div className='flex items-center h-8'>
                {isSearchExpanded && (
                  <input className='input' placeholder='Search' onChange={e => onSearch && onSearch(e.target.value)} />
                )}
                <div 
                  className={`h-5 w-5 w-fit cursor-pointer ml-2 ${isSearchExpanded ? 'text-swishjam hover:text-swishjam-dark' : 'text-gray-400 hover:text-gray-700'}`}
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                >
                  <MagnifyingGlassIcon className='h-5 w-5' />
                </div>
              </div>
            </div>
          </Menu.Item>
          {options.map(({ text, value, isSelected }) => {
            return (
              <Menu.Item key={value}>
                {({ active }) => (
                  <div
                    onClick={() => {
                      if (isSelected) return;
                      setSelectedOption(value);
                      onSelect(value);
                    }}
                    className={classNames(
                      isSelected ? 'bg-blue-100 text-gray-900' : active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      `truncate group flex items-center w-full justify-between px-4 py-2 text-sm relative pl-10`
                    )}
                  >
                    {isSelected &&
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    }
                    {text}
                  </div>
                )}
              </Menu.Item>
            )
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}