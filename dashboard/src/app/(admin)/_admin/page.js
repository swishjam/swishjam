'use client'

import { useEffect, useState } from 'react'
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import { intelligentlyFormattedMs } from '@/lib/utils/timeHelpers'

export default function AdminPage() {
  // const [queueingData, setQueueingData] = useState();
  const [eventCountsTimeseries, setEventCountsTimeseries] = useState();
  const [ingestionBatches, setIngestionBatches] = useState();
  const [queueStats, setQueueStats] = useState();

  useEffect(() => {
    // SwishjamAPI.Admin.Ingestion.queueing().then(setQueueingData);
    SwishjamAPI.Admin.Ingestion.eventCounts().then(setEventCountsTimeseries)
    SwishjamAPI.Admin.Ingestion.queueStats().then(setQueueStats)
    SwishjamAPI.Admin.Ingestion.ingestionBatches().then(setIngestionBatches)
  }, [])

  console.log(eventCountsTimeseries)
  return (
    <>
      <div className='grid grid-cols-3 space-x-4 mb-8'>
        <div className='rounded border border-gray-400 text-gray-700 flex items-center justify-center p-4'>
          <div className='text-center'>
            <h4 className='text-md'>event queue</h4>
            <h1 className='text-4xl'>{queueStats?.event_count}</h1>
          </div>
        </div>
        <div className='rounded border border-gray-400 text-gray-700 flex items-center justify-center p-4'>
          <div className='text-center'>
            <h4 className='text-md'>user_identify queue</h4>
            <h1 className='text-4xl'>{queueStats?.user_identify_count}</h1>
          </div>
        </div>
        <div className='rounded border border-gray-400 text-gray-700 flex items-center justify-center p-4'>
          <div className='text-center'>
            <h4 className='text-md'>organization_identify queue</h4>
            <h1 className='text-4xl'>{queueStats?.organization_identify_count}</h1>
          </div>
        </div>
      </div>
      <LineChartWithValue
        title='Global events ingested.'
        value={eventCountsTimeseries && eventCountsTimeseries[eventCountsTimeseries.length - 1].value}
        timeseries={eventCountsTimeseries}
        groupedBy='hour'
        showAxis={true}
        showYAxis={true}
      />
      {ingestionBatches && (
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className='grid grid-cols-5'>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Number of records
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Completed at
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Seconds to complete
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Error message
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {ingestionBatches.map(batch => (
              <tr
                key={batch.id}
                className="group hover:bg-gray-50 duration-300 transition grid grid-cols-5 items-center"
              >
                <td className="whitespace-nowrap px-3 py-3.5 text-sm">{batch.event_type}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-sm">{batch.num_records}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-sm">{new Date(batch.completed_at).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: 'numeric', minute: 'numeric' })}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-sm">{batch.num_seconds_to_complete}</td>
                <td className="px-3 py-3.5 text-sm">{batch.error_message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}