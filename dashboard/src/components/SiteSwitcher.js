'use client';
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { GlobeAltIcon, PlusCircleIcon } from '@heroicons/react/20/solid'
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@components/AuthProvider'
import LoadingSpinner from '@components/LoadingSpinner';
import NewSiteDialog from '@components/NewSiteDialog';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SiteSwitcher(props) {
  const { currentProject, updateCurrentProject, userOrg, projects } = useAuth();
  const [ isDialogOpenSwitcher, setIsDialogOpenSwitcher ] = useState(false);

  if(!currentProject || projects?.length === 0) {
    return <></>
  }


  return (
    <div {...props}>
      <Menu as="div" className="">
        <div>
          <Menu.Button
            className={'w-full cursor-pointer justify-between text-gray-700 hover:text-swishjam hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 transition items-center'}
          >
            {currentProject?.name ? <span className='truncate'>{currentProject?.name}</span>:<div className="mt-1"><LoadingSpinner size={4} /></div>}
            <Cog6ToothIcon
              className={'text-gray-400 group-hover:text-swishjam duration-300 transition h-4 w-4 shrink-0 '}
              aria-hidden="true"
            />
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
          <Menu.Items className="absolute z-10 mt-2 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none cursor-pointer">
            <div className="py-1">
              {projects?.map((project) => (
                <Menu.Item key={project.id}>
                  {({ active }) => (
                    <div
                      onClick={() => updateCurrentProject(project)}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'truncate group flex items-center px-4 py-2 text-sm'
                      )}
                    >
                      <GlobeAltIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      <span className='max-w-lg truncate'>{project.name} </span>
                    </div>
                  )}
                </Menu.Item>
              ))} 
            </div>
            <div className="py-1 min-w-fit">
              <Menu.Item className="min-w-fit">
                <div
                  onClick={() => setIsDialogOpenSwitcher(true)}
                  className={'w-48 flex items-center px-4 py-2 text-sm hover:text-swishjam cursor-pointer'}
                >
                  <PlusCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-swishjam" aria-hidden="true" />
                  Add Project
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
        onComplete={(newProject) => setIsDialogOpenSwitcher(false)}
      />}
    </div>
  )
}