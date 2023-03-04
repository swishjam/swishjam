'use client';
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  GlobeAltIcon,
  ChevronDownIcon,
  PlusCircleIcon
} from '@heroicons/react/20/solid'
import { useAuth } from '@components/AuthProvider'
import LoadingSpinner from '@components/LoadingSpinner';
import NewSiteDialog from '@components/NewSiteDialog';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SiteSwitcher(props) {
  const { currentSite, setCurrentSite, userOrg, allSites } = useAuth();
  const [ isDialogOpenSwitcher, setIsDialogOpenSwitcher ] = useState(false);

  return (
    <div {...props}>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            {currentSite?.url || <div className="mt-1"><LoadingSpinner size={4} /></div>} 
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400 mt-1" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none cursor-pointer">
            <div className="py-1">
              {allSites?.map((site) => (
                <Menu.Item key={site.id}>
                  {({ active }) => (
                    <div
                      onClick={() => setCurrentSite(site)}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'truncate group flex items-center px-4 py-2 text-sm'
                      )}
                    >
                      <GlobeAltIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      {site.url} 
                    </div>
                  )}
                </Menu.Item>
              ))} 
            </div>
            <div className="py-1">
              <Menu.Item>
                <div
                  onClick={() => setIsDialogOpenSwitcher(true)}
                  className={'group flex items-center px-4 py-2 text-sm hover:text-swishjam cursor-pointer'}
                >
                  <PlusCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-swishjam" aria-hidden="true" />
                  Add Site
                </div>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
                
      {userOrg && 
      <NewSiteDialog
        isOpen={isDialogOpenSwitcher}
        onClose={() => setIsDialogOpenSwitcher(false)}
        onComplete={(newSite) => setIsDialogOpenSwitcher(false)}
        organizationId={userOrg.id}
      />}
    </div>
  )
}