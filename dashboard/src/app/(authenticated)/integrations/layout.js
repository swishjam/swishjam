'use client';

import { VerticalTabs } from '@components/VerticalTabs'
import Divider from '@/components/Divider';
import { LuWorkflow, LuSparkles } from "react-icons/lu";
import { TbReport } from "react-icons/tb";

const sidebarNavItems = [
  {
    title: "Data Sources",
    href: "/integrations",
    icon: LuWorkflow,
  },
  {
    title: "Destinations",
    href: "/integrations/destinations",
    icon: TbReport,
  },
]

export default function IntegrationsLayout({ children }) {

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Integrations</h1>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-8">
        <aside className="lg:w-1/5">
          <VerticalTabs items={sidebarNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div> 
      {/*<Tabs className="mb-8" currentPath={pathname} />*/}
    </main>
  )
}