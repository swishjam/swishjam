'use client';

import { VerticalTabs } from '@components/VerticalTabs'
import Divider from '@/components/Divider';
import { LuWorkflow } from "react-icons/lu";
import { TbReport } from "react-icons/tb";
import { usePathname } from 'next/navigation';

const sidebarNavItems = [
  {
    title: "Event Triggers",
    href: "/automations/event-triggers",
    icon: LuWorkflow,
  },
  {
    title: "Reports",
    href: "/automations/reports",
    icon: TbReport,
  },
]

export default function AutomationsLayout({ children }) {
  const path = usePathname();
  if (path.endsWith('/new') || path.endsWith('/edit') || path.endsWith('/details') || path.includes('/flows')) {
    return <div className='overflow-x-hidden'>{children}</div>
  }
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Automations</h1>
        </div>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-8">
        {/* <aside className="lg:w-1/6">
          <VerticalTabs items={sidebarNavItems} />
        </aside> */}
        <div className="flex-1">
          {children}
        </div>
      </div>
      {/*<Tabs className="mb-8" currentPath={pathname} />*/}
    </main>
  )
}