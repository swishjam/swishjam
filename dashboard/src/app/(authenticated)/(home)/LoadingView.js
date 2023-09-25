'use client'

import ActiveUsersLineChart from "@/components/DashboardComponents/Prebuilt/ActiveUsersLineChart"
import ItemizedUsersList from "@/components/DashboardComponents/Prebuilt/ItemizedUsersList"
import ItemizedOrganizationsList from "@/components/DashboardComponents/Prebuilt/ItemizedOrganizationList"
import LineChartWithValue from "@/components/DashboardComponents/LineChartWithValue"
import ClickableValueCard from "@/components/DashboardComponents/ClickableValueCard"
import { Separator } from "@/components/ui/separator"

export default function LoadingView() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
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