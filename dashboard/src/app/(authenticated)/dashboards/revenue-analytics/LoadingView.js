import LineChartWithValue from "@/components/Dashboards/DataVisualizations/AreaChartWithValue"
import BarList from "@/components/Dashboards/DataVisualizations/BarList"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingView() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Marketing Site Metrics</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Skeleton className='w-32 h-10 bg-gray-100' />
          <Skeleton className='ml-4 w-12 h-10 bg-gray-100' />
        </div>
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <div className='col-span-2'>
          <LineChartWithValue title='Sessions' />
        </div>
        <LineChartWithValue title='Sessions' />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarList title='Referrers' />
        <BarList title='Top Pages' />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarList title='Devices' />
        <BarList title='Browsers' />
      </div>
    </main>
  )
}