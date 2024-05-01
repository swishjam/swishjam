'use client'

import ActiveUsersLineChart from "@/components/Dashboards/DataVisualizations/ActiveUsersLineChartWithValue"
import ItemizedUsersList from "@/components/Dashboards/DataVisualizations/ItemizedList"
import ItemizedOrganizationsList from "@/components/Dashboards/DataVisualizations/ItemizedList"
import LineChartWithValue from "@/components/Dashboards/DataVisualizations/AreaChartWithValue"
import ClickableValueCard from "@/components/Dashboards/DataVisualizations/ClickableValueCard"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingView() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Skeleton className='w-32 h-10 bg-gray-100' />
          <Skeleton className='ml-4 w-12 h-10 bg-gray-100' />
        </div>
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <ClickableValueCard title='MRR' />
        <ClickableValueCard title='Active Subscriptions' />
        <ClickableValueCard title='Sessions' />
      </div>
      <div className='grid grid-cols-1 gap-6 pt-8'>
        <LineChartWithValue title='MRR' />
        <Separator className="my-6" />

      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ActiveUsersLineChart loadingStateOnly={true} />
        <LineChartWithValue title='Sessions' />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <LineChartWithValue title='MRR' />
        <LineChartWithValue title='Active Subscriptions' />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ItemizedUsersList />
        <ItemizedOrganizationsList />
      </div>
    </main>
  )
}