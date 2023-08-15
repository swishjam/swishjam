import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Logo from '@components/Logo';

const ListTitle = ({ title, Icon, isCollapsed }) => {
  return (
    <div className={`flex text-xs font-semibold leading-6 text-gray-400 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
      {!isCollapsed && Icon && <Icon className="h-4 w-4 mt-1 mr-2" aria-hidden="true" />}
      {title}
    </div>
  )
}

export default function SidebarMobile({ sidebarOpen, setSidebarOpen, userEmail, handleSignOut }) {
  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center">
                  <Link href="/">
                    <Logo className="h-8" />
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className='flex flex-1 flex-col gap-y-7'>
                    <li className="">
                      <div className="mt-2">
                        <ListTitle title={'Settings'} />
                      </div>
                      <div className="">
                        <div
                          onClick={() => handleSignOut()}
                          className={'cursor-pointer duration-300 transition text-gray-700 hover:text-swishjam hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'}
                        >
                          <ArrowLeftOnRectangleIcon
                            className={'duration-300 transition text-gray-400 group-hover:text-swishjam h-6 w-6 shrink-0'}
                            aria-hidden="true"
                          />
                          <span className="truncate">Sign Out</span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-gray-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className='cursor-default' aria-hidden="true">{userEmail}</span>
                      </div>

                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}