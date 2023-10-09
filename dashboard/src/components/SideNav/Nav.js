'use client';
import { usePathname } from 'next/navigation'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  GlobeAmericasIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  SquaresPlusIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import SidebarMobile from './MobileNav';
import ProfileFlyout from './ProfileFlyout';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@components/Logo'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { RxBarChart } from 'react-icons/rx'
import useCommandBar from '@/hooks/useCommandBar';
// import { SwishjamMemory } from '@/lib/swishjam-memory';

const appNav = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Visitor Trends', href: '/visitor-trends', icon: RxBarChart },
  { name: 'Event Explorer', href: '/events', icon: GlobeAmericasIcon },
  { name: 'Users', href: '/users', icon: UserIcon },
  { name: 'Organizations', href: '/organizations', icon: UserGroupIcon },
  { name: 'Connections', href: '/connections', icon: SquaresPlusIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const classNames = (...classes) => classes.filter(Boolean).join(' ')

const DesktopNavItem = ({ item, isCollapsed, category, currentPath }) => {
  const isCurrentPage = menuItemHref => currentPath == menuItemHref;

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

export default function Sidebar({ onCollapse, onExpand, email }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setCommandBarIsOpen } = useCommandBar();
  //typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);

  useEffect(() => {
    // if(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean') {
    //   setIsCollapsed(SwishjamMemory.get('isNavCollapsed'));
    // }
  }, [])

  return (
    <>
      <div>
        <SidebarMobile sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userEmail={email} />
        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:w-12' : 'lg:w-64'}`}>
          <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white ${isCollapsed ? 'px-1' : 'px-6'}`}>
            <div className={`flex h-16 shrink-0 items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <Link href="/">
                <Logo className="h-8" />
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="space-y-1">
                    {appNav.map((item) => <DesktopNavItem item={item} key={item.name} isCollapsed={isCollapsed} category="" currentPath={pathname} />)}
                    <li>
                      <a
                        onClick={() => setCommandBarIsOpen(true)}
                        className={`flex cursor-pointer text-gray-700 hover:text-swishjam hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold duration-500 transition ${isCollapsed ? 'py-2 px-1' : 'p-2'}`}
                      >
                        <MagnifyingGlassIcon className='inline text-gray-400 group-hover:text-swishjam duration-500 transition h-6 w-6 shrink-0' />
                        <span>{isCollapsed ? '' : 'Search'}</span>
                      </a>
                    </li>
                  </ul>
                </li>
                {email && !isCollapsed && (
                  <li className="-mx-6 mt-auto">
                    <ProfileFlyout userEmail={email} />
                  </li>
                )}
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
        className={`transition-left duration-300 ease-in-out fixed text-gray-700 p-1 top-0 cursor-pointer border-b rounded-br-lg border-r z-30 bg-white -ml-[1px] border-gray-200 hover:text-swishjam hover:bg-gray-50 ${isCollapsed ? 'left-12' : 'left-64'}`}
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          isCollapsed ? onExpand() : onCollapse();
          // SwishjamMemory.set('isNavCollapsed', !isCollapsed);
        }}
      >
        {isCollapsed ? <ChevronRightIcon className="h-4 w-4 hover:scale-110" /> : <ChevronLeftIcon className="h-4 w-4 hover:scale-110" />}
      </div>
    </>
  );
}
