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
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WindowIcon,
} from '@heroicons/react/24/outline'

import { useAuth } from './AuthProvider';
import { Fragment, useState } from 'react'
import Link from 'next/link'
import Logo from '@components/Logo'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import SiteSwitcher from '@components/SiteSwitcher';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { SwishjamMemory } from '@/lib/swishjam-memory';

const rumNav = [
  { name: 'Core Web Vitals', href: '/', icon: HeartIcon },
  { name: 'Resource Waterfall', href: '/waterfall', icon: Bars3CenterLeftIcon },
  { name: 'Page Breakdown', href: '/page-breakdown', icon: RectangleGroupIcon },
  { name: 'Visitor Demographics', href: '/visitor-demographics', icon: IdentificationIcon },
  { name: 'Chrome Data', href: '/crux', icon: WindowIcon }
]

const labTestNav = [
  { name: 'Lab Tests', href: '/lab-tests', icon: ServerStackIcon },
  { name: 'Configure', href: '/lab-tests/manage', icon: AdjustmentsHorizontalIcon },
]

const isCurrentPage = menuItemHref => menuItemHref === window.location.pathname

const classNames = (...classes) => classes.filter(Boolean).join(' ')

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
                  <ul role="list" className='flex flex-1 flex-col gap-y-7'>
                    <li>
                      <ListTitle title={'Current Project'} Icon={CodeBracketSquareIcon} />
                      <div className="space-y-1">
                        <SiteSwitcher />
                      </div>
                    </li>
                    <li>
                      <ul role="list" className="mt-2 space-y-1">
                        <ListTitle title={'Real User Monitoring'} Icon={CursorArrowRippleIcon} /> 
                        {rumNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
                      </ul>
                    </li>
                    <li>
                      <ul role="list" className="mt-2 space-y-1">
                        <ListTitle title={'Lab Tests'} Icon={BeakerIcon} /> 
                        {labTestNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
                      </ul>
                    </li>
                    <li className="">
                      <div className="mt-2">
                      <ListTitle title={'Settings'}/> 
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


const ListTitle = ({ title, Icon, isCollapsed }) => {
  return (
    <div className={`flex text-xs font-semibold leading-6 text-gray-400 mb-2 ${isCollapsed ? 'justify-center': ''}`}>
      {!isCollapsed && Icon && <Icon className="h-4 w-4 mt-1 mr-2" aria-hidden="true" />}
      {title}
    </div>
  )
}

const DesktopNavItem = ({ item, isCollapsed }) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ placement: 'right' });

  return (
    <li key={item.name} ref={setTriggerRef}>
      <a
        href={item.href}
        className={classNames(
          isCurrentPage(item.href)
            ? 'bg-gray-50 text-swishjam'
            : 'text-gray-700 hover:text-swishjam hover:bg-gray-50',
          `group flex gap-x-3 rounded-mp-2 text-sm leading-6 font-semibold duration-300 transition ${isCollapsed ? 'py-2 px-1' : 'p-2'}`
        )}
      >
        {item.icon && <item.icon
          className={classNames(
            isCurrentPage(item.href) ? 'text-swishjam' : 'text-gray-400 group-hover:text-swishjam duration-300 transition',
            'h-6 w-6 shrink-0'
          )}
          aria-hidden="true"
        />}
        {isCollapsed ? '' : item.name}
      </a>
      {isCollapsed && visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container w-fit' })}>
          <div className="tooltip-arrow" {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className="text-xs text-gray-700">{item.name}</div>
        </div>
      )}            
    </li>
  )
}

export default function Sidebar({ onCollapse, onExpand }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
  const { signOut, user } = useAuth();

  return (
    <>
      <div>
        <SidebarMobile
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}   
          handleSignOut={signOut} 
        />
    

        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:flex-col transition ${isCollapsed ? 'lg:w-10' : 'lg:w-72'}`}>
          <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white ${isCollapsed ? 'px-1' : 'px-6'}`}>
            <div className={`flex h-16 shrink-0 items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <Link href="/">
                <Logo className="h-8"/>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                {!isCollapsed && <li>
                  <ListTitle title={isCollapsed ? '' : 'Current Project'} Icon={CodeBracketSquareIcon} isCollapsed={isCollapsed} /> 
                  <div className="space-y-1">
                    <SiteSwitcher />
                  </div>
                </li>}
                <li>
                  <ListTitle title={isCollapsed ? 'RUM' : 'Real User Monitoring'} isCollapsed={isCollapsed} Icon={CursorArrowRippleIcon} /> 
                  <ul role="list" className="space-y-1">
                    {rumNav.map((item) => <DesktopNavItem item={item} key={item.name} isCollapsed={isCollapsed} />)}
                  </ul>
                </li>
                <li>
                  <ListTitle title={isCollapsed ? 'Lab' : 'Lab Tests'} Icon={BeakerIcon} isCollapsed={isCollapsed} /> 
                  <ul role="list" className="space-y-1">
                    {labTestNav.map((item) => <DesktopNavItem item={item} key={item.name} isCollapsed={isCollapsed} />)}
                  </ul>
                </li>
                {!isCollapsed && <li className="-mx-6 mt-auto">
                  <div className="mx-4">
                    <div
                      onClick={signOut} 
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

                </li>}
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
      <div
        className={`fixed text-gray-700 p-1 top-0 cursor-pointer transition border-b border-r z-30 bg-white -ml-[1px] border-gray-200 hover:underline ${isCollapsed ? 'left-10' : 'left-72'}`}
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          isCollapsed ? onExpand() : onCollapse();
          SwishjamMemory.set('isNavCollapsed', !isCollapsed);
        }}
        >
        {isCollapsed ? <ChevronRightIcon className="h-4 w-4 text-gray-700 transition hover:scale-105" /> : <ChevronLeftIcon className="h-4 w-4 transition hover:scale-105" />}
      </div>
    </>
  );
}
