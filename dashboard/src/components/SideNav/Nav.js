'use client';
import { usePathname } from 'next/navigation'
import SidebarMobile from './MobileNav';
import ProfileFlyout from './ProfileFlyout';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@components/Logo'
import useCommandBar from '@/hooks/useCommandBar';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import { Tooltipable } from '../ui/tooltip';

import { LuHome, LuBarChart, LuUser, LuHotel, LuCircuitBoard, LuSettings, LuMoreVertical, LuSearch, LuPresentation } from 'react-icons/lu'
import { PiMagicWand } from "react-icons/pi";
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';

const appNav = [
  { name: 'Home', href: '/', icon: LuHome },
  { name: 'Visualize', href: '/dashboards', icon: LuBarChart },
  // { name: 'Analyze', href: '/events', icon: LuFlaskConical }, // HIDING FROM NAV FOR NOW
  { name: 'Automations', href: '/automations', icon: PiMagicWand },
  { name: 'Reports', href: '/reports', icon: LuPresentation },
  { name: 'Users', href: '/users', icon: LuUser },
  { name: 'Organizations', href: '/organizations', icon: LuHotel },
  { name: 'Integrations', href: '/integrations', icon: LuCircuitBoard },
  { name: 'Settings', href: '/settings', icon: LuSettings },
]

const classNames = (...classes) => classes.filter(Boolean).join(' ')

const TooltipableNavItem = ({ isCollapsed, tooltipText, children }) => {
  if (isCollapsed) {
    return (
      <Tooltipable direction='right' content={tooltipText}>
        {children}
      </Tooltipable>
    )
  } else {
    return children;
  }
}

const DesktopNavItem = ({ item, isCollapsed, currentPath }) => {
  const isCurrentPage = menuItemHref => currentPath == menuItemHref;

  return (
    <li key={item.name}>
      <TooltipableNavItem isCollapsed={isCollapsed} tooltipText={item.name}>
        <Link
          href={item.href}
          className={classNames(
            isCurrentPage(item.href)
              ? 'bg-accent text-swishjam'
              : 'text-gray-700 hover:bg-accent',
            `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 transition ${isCollapsed ? 'py-2 px-1 justify-center' : 'p-2'}`
          )}
        >
          {item.icon && <item.icon
            className={classNames(
              isCurrentPage(item.href) ? 'text-swishjam' : 'text-gray-400 duration-300 transition',
              'h-6 w-6 shrink-0'
            )}
            aria-hidden="true"
          />}
          {isCollapsed ? '' : item.name}
        </Link>
      </TooltipableNavItem>
    </li>
  )
}

export default function Sidebar({ onCollapse, onExpand, email }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setCommandBarIsOpen } = useCommandBar();
  // typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false;

  useEffect(() => {
    if (typeof SwishjamMemory.get('isNavCollapsed') === 'boolean') {
      setIsCollapsed(SwishjamMemory.get('isNavCollapsed'));
    }
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
                      <TooltipableNavItem isCollapsed={isCollapsed} tooltipText='Command Bar'>
                        <a
                          onClick={() => setCommandBarIsOpen(true)}
                          className={`flex cursor-pointer text-gray-700 hover:bg-accent group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 transition ${isCollapsed ? 'py-2 px-1 justify-center' : 'p-2'}`}
                        >
                          <LuSearch className='inline text-gray-400 duration-300 transition h-6 w-6 shrink-0' />
                          {isCollapsed ? '' : 'Search'}
                        </a>
                      </TooltipableNavItem>
                    </li>
                  </ul>
                </li>
                {email && !isCollapsed && (
                  <li className="-mx-6 mt-auto">
                    <ProfileFlyout userEmail={email} />
                  </li>
                )}
                {isCollapsed && (
                  <li
                    className={`mt-auto text-gray-700 w-full py-4 bottom-1 cursor-pointer bg-white border-gray-200 hover:text-swishjam hover:bg-gray-50`}
                    onClick={() => {
                      setIsCollapsed(false);
                      onExpand();
                      SwishjamMemory.set('isNavCollapsed', false);
                    }}
                  >
                    <ChevronsRightIcon className="h-4 w-4 mx-auto hover:scale-110" />
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <LuMoreVertical className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div
          className='fixed text-gray-700 p-1 bottom-1 cursor-pointer border border-l-0 rounded-r-lg z-30 bg-white -ml-[1px] border-gray-200 hover:text-swishjam hover:bg-gray-50 left-64'
          onClick={() => {
            setIsCollapsed(true);
            onCollapse();
            SwishjamMemory.set('isNavCollapsed', true);
          }}
        >
          <ChevronsLeftIcon className="h-4 w-4 mx-auto hover:scale-110" />
          {/* {isCollapsed ? <LuChevronRight className="h-4 w-4 hover:scale-110" /> : <LuChevronLeft className="h-4 w-4 hover:scale-110" />} */}
        </div>
      )}
    </>
  );
}
