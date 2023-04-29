'use client';
import {
  HeartIcon,
  CodeBracketSquareIcon,
  ServerStackIcon,
  RectangleGroupIcon,
  Bars3CenterLeftIcon,
  CursorArrowRippleIcon,
  BeakerIcon,
  ArrowLeftOnRectangleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline'

import { useAuth } from './AuthProvider';
import { Fragment, useState } from 'react'
import Link from 'next/link'
import Logo from '@components/Logo'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import SiteSwitcher from '@components/SiteSwitcher';

const rumNav = [
  { name: 'Core Web Vitals', href: '/', icon: HeartIcon },
  { name: 'Resource Waterfall', href: '/waterfall', icon: Bars3CenterLeftIcon },
  { name: 'Page Breakdown', href: '/page-breakdown', icon: RectangleGroupIcon },
  { name: 'Visitor Demographics', href: '/visitor-demographics', icon: IdentificationIcon },
]

const labTestNav = [
  { name: 'Lab Tests', href: '/lab-tests', icon: ServerStackIcon },
]

function isCurrentPage(menuItemHref) {
  return menuItemHref === window.location.pathname
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const SidebarMobile = ({ sidebarOpen, setSidebarOpen, user, handleSignOut }) => {
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
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ListTitle title={'Current Project'} Icon={CodeBracketSquareIcon} />
                      <div className="-mx-2 space-y-1">
                        <SiteSwitcher />
                      </div>
                    </li>
                    <li>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        <ListTitle title={'Real User Monitoring'} Icon={CursorArrowRippleIcon} /> 
                        {rumNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
                      </ul>
                    </li>
                    <li>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        <ListTitle title={'Lab Tests'} Icon={BeakerIcon} /> 
                        {labTestNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
                      </ul>
                    </li>
                    <li className="">
                      <div className="-mx-2 mt-2">
                      <ListTitle title={'Settings'}/> 
                      </div> 
                      <div className="-mx-2">
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
                        className="-mx-2 flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-gray-900"
                      >
                        {user && user.imageUrl ?
                          <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" /> :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                        <span className='cursor-default' aria-hidden="true">{user.email}</span>
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


const ListTitle = ({ title, Icon }) => {
  return (
    <div className="-mx-2 flex text-xs font-semibold leading-6 text-gray-400 mb-2">
      {Icon && <Icon className="h-4 w-4 mt-1 mr-2" aria-hidden="true" />}
      {title}
    </div>
  )
}

const DesktopNavItem = ({ item }) => {
  return (
    <li key={item.name}>
      <a
        href={item.href}
        className={classNames(
          isCurrentPage(item.href)
            ? 'bg-gray-50 text-swishjam'
            : 'text-gray-700 hover:text-swishjam hover:bg-gray-50',
          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 transition'
        )}
      >
        {item.icon && <item.icon
          className={classNames(
            isCurrentPage(item.href) ? 'text-swishjam' : 'text-gray-400 group-hover:text-swishjam duration-300 transition',
            'h-6 w-6 shrink-0'
          )}
          aria-hidden="true"
        />}
        {item.name}
      </a>
    </li>
  )
}

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user, currentProject } = useAuth();

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      console.error('ERROR signing out:', error);
    }
  }

  return (
    <>
      <div>
        <SidebarMobile
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}   
          handleSignOut={handleSignOut} 
        />
    
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/">
                <Logo className="h-8"/>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ListTitle title={'Current Project'} Icon={CodeBracketSquareIcon} /> 
                  <div className="-mx-2 space-y-1">
                    <SiteSwitcher />
                  </div>
                </li>
                <li>
                  <ListTitle title={'Real User Monitoring'} Icon={CursorArrowRippleIcon} /> 
                  <ul role="list" className="-mx-2 space-y-1">
                    {rumNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
                  </ul>
                </li>
                <li>
                  <ListTitle title={'Lab Tests'} Icon={BeakerIcon} /> 
                  <ul role="list" className="-mx-2 space-y-1">
                    {labTestNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <div className="mx-4">
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
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900"
                  >
                    {user && user.imageUrl ? 
                    <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />:
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    }
                    <span className='cursor-default' aria-hidden="true">{user.email}</span>
                  </div>

                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
