'use client'

import { LuHotel, LuUser } from 'react-icons/lu'
import { usePathname } from 'next/navigation';
import PageWithHeader from '@/components/utils/PageWithHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
const isCurrentPage = (menuItemHref, currentPath) => currentPath == menuItemHref;

const tabs = [
  { name: 'User Cohorts', href: '/cohorts/users', icon: LuUser },
  { name: 'Organization Cohorts', href: '/cohorts/organizations', icon: LuHotel },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function CohortsLayout({ children }) {
  const currentPath = usePathname();
  if (['/cohorts/users', '/cohorts/organizations'].includes(currentPath)) {
    const isUserCohorts = currentPath === '/cohorts/users';
    return (
      <PageWithHeader
        title="Cohorts"
        buttons={[
          <Link href={`/cohorts/${isUserCohorts ? 'users' : 'organizations'}/new`}>
            <Button variant='swishjam'>New {isUserCohorts ? 'User' : 'Organization'} Cohort</Button>
          </Link>
        ]}
      >
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  isCurrentPage(tab.href, currentPath)
                    ? 'border-swishjam text-swishjam'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={isCurrentPage(tab.href, currentPath) ? 'page' : undefined}
              >
                <tab.icon
                  className={classNames(
                    isCurrentPage(tab.href, currentPath) ? 'text-swishjam' : 'text-gray-400 group-hover:text-gray-500',
                    '-ml-0.5 mr-2 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                <span>{tab.name}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className='mt-8'>
          {children}
        </div>
      </PageWithHeader>
    )
  } else {
    return children;
  }
}