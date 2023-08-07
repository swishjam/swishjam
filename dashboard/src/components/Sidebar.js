'use client';
import {
  ChartBarSquareIcon,
  SquaresPlusIcon, 
  CodeBracketSquareIcon,
  CursorArrowRippleIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider';
import { Fragment, useState } from 'react'
import Link from 'next/link'
import Logo from '@components/Logo'
import { Menu, Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { SwishjamMemory } from '@/lib/swishjam-memory';

const appNav = [
  { name: 'Dashboard', href: '/', icon: ChartBarSquareIcon },
  { name: 'Connections', href: '/connections', icon: SquaresPlusIcon},
]

const isCurrentPage = menuItemHref => typeof window === 'undefined' ? false : menuItemHref === window.location.pathname;

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
                      </div>
                    </li>
                    <li>
                      <ul role="list" className="mt-2 space-y-1">
                        <ListTitle title={'Real User Monitoring'} Icon={CursorArrowRippleIcon} /> 
                        {appNav.map((item) => <DesktopNavItem item={item} key={item.name} />)}
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
                        {user?.imageUrl 
                          ? <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" /> 
                          : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )
                        }
                        <span className='cursor-default' aria-hidden="true">{user?.email}</span>
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

const UserFlyout = ({ userEmail, signOut, currentOrg, userOrgs, updateCurrentOrganization }) => {
  return (
    <>
      <Menu as="div" className="relative inline-block text-left w-full">
        <div>
          <Menu.Button className="px-8 inline-flex justify-between items-center w-full rounded-md bg-white py-2 text-sm text-gray-900 hover:bg-gray-50">
            <div className='flex items-center truncate'>
              <UserCircleIcon className='text-gray-400 group-hover:text-swishjam duration-300 transition h-6 w-6 shrink-0 inline-block mr-2' /> 
              <span className='truncate'>{userEmail}</span>
            </div>
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
          <Menu.Items className="absolute left-0 bottom-0 w-full z-10 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Button className="w-full px-4 py-3 flex w-full justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div className='flex items-center truncate'>
                <UserCircleIcon className='text-gray-900 duration-300 transition h-6 w-6 shrink-0 inline-block mr-2' />
                <p className="truncate text-sm font-medium text-gray-900">{userEmail}</p>
              </div>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
            <a
              className='flex items-center w-full text-start px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-swishjam transition'
              href='/team'
            >
              <UserGroupIcon className='h-6 w-6 inline-block mr-2' /> Manage team
            </a>
            {userOrgs && userOrgs.length > 1 && (
              <>
                <div className='text-gray-700 px-4 py-2 text-sm text-gray-900 font-medium'>
                  Change organizations
                </div>
                {userOrgs.map(org => (
                  <Menu.Button
                    className={`block w-full text-start px-4 py-2 text-sm ${org.id === currentOrg.id ? 'bg-gray-100 text-swishjam cursor-default' : 'cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-swishjam transition'}`}
                    onClick={() => updateCurrentOrganization(org)}
                    key={org.id}
                  >
                    <div className='rounded-full bg-gray-300 text-gray-900 text-xs w-8 h-8 p-1 inline-flex items-center justify-center mr-2'>
                      {org.name.split(' ').map(word => word[0]).join('')}
                    </div>
                    <span>{org.name}</span>
                  </Menu.Button>
                ))}
              </>
            )}
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="submit"
                    onClick={signOut}
                    className={classNames(
                      active ? 'bg-red-100 text-red-500' : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-sm'
                    )}
                  >
                    <ArrowLeftOnRectangleIcon className='h-6 w-6 inline-block mr-2' />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  )
}

const DesktopNavItem = ({ item, isCollapsed, category}) => {

  return (
    <li key={item.name}>
      <a
        href={item.href}
        className={classNames(
          isCurrentPage(item.href)
            ? 'bg-gray-50 text-swishjam'
            : 'text-gray-700 hover:text-swishjam hover:bg-gray-50',
          `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold duration-500 transition ${isCollapsed ? 'py-2 px-1' : 'p-2'}`
        )}
      >
        {item.icon && <item.icon
          className={classNames(
            isCurrentPage(item.href) ? 'text-swishjam' : 'text-gray-400 group-hover:text-swishjam duration-500 transition',
            'h-6 w-6 shrink-0'
          )}
          aria-hidden="true"
        />}
        {isCollapsed ? '' : item.name}
      </a>
    </li>
  )
}

export default function Sidebar({ onCollapse, onExpand }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
  const { signOut, user, userOrg, userOrgs, updateCurrentOrganization } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      <div>
        <SidebarMobile
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}   
          handleSignOut={signOut} 
        />

        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:w-10' : 'lg:w-72'}`}>
          <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300 ${isCollapsed ? 'px-1' : 'px-6'}`}>
            <div className={`flex h-16 shrink-0 items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
              <Link href="/">
                <Logo className="h-8"/>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="space-y-1">
                    {appNav.map((item) => <DesktopNavItem item={item} key={item.name} isCollapsed={isCollapsed} category=""/>)}
                  </ul>
                </li>
                {user && !isCollapsed && <li className="-mx-6 mt-auto">
                  <UserFlyout 
                    userEmail={user.email} 
                    signOut={signOut} 
                    currentOrg={userOrg}
                    userOrgs={userOrgs} 
                    updateCurrentOrganization={updateCurrentOrganization} 
                  />
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
        className={`fixed text-gray-700 p-1 top-0 cursor-pointer transition-all duration-500 border-b rounded-br-lg border-r z-30 bg-white -ml-[1px] border-gray-200 hover:text-swishjam hover:bg-gray-50 ${isCollapsed ? 'left-10' : 'left-72'}`}
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          isCollapsed ? onExpand() : onCollapse();
          SwishjamMemory.set('isNavCollapsed', !isCollapsed);
        }}
        >
        {isCollapsed ? <ChevronRightIcon className="h-4 w-4 transition hover:scale-110" /> : <ChevronLeftIcon className="h-4 w-4 transition hover:scale-110" />}
      </div>
    </>
  );
}
