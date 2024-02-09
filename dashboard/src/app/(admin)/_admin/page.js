'use client'

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton';
import { intelligentlyFormattedMs } from '@/lib/utils/timeHelpers';
import { setStateFromTimeseriesResponse } from '@/lib/utils/timeseriesHelpers';

export default function AdminPage() {
  const [dataSyncs, setDataSyncs] = useState();
  const [eventCountsTimeseries, setEventCountsTimeseries] = useState();
  const [eventTriggerDelayTimeTimeseries, setEventTriggerDelayTimeTimeseries] = useState();
  const [ingestionBatches, setIngestionBatches] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [queueStats, setQueueStats] = useState();
  const [queueingTimeTimeseries, setQueueingTimeTimeseries] = useState();

  const getData = async () => {
    setIsRefreshing(true);
    setEventCountsTimeseries();
    setIngestionBatches();
    setQueueStats();
    setDataSyncs();
    setQueueingTimeTimeseries();
    setEventTriggerDelayTimeTimeseries();
    await Promise.all([
      SwishjamAPI.Admin.Ingestion.eventCounts().then(setEventCountsTimeseries),
      SwishjamAPI.Admin.Ingestion.queueStats().then(setQueueStats),
      SwishjamAPI.Admin.Ingestion.ingestionBatches().then(setIngestionBatches),
      SwishjamAPI.Admin.DataSyncs.list().then(setDataSyncs),
      SwishjamAPI.Admin.Ingestion.queueing().then(d => setStateFromTimeseriesResponse(d, setQueueingTimeTimeseries)),
      SwishjamAPI.Admin.EventTriggers.delayTimeTimeseries().then(response => {
        setEventTriggerDelayTimeTimeseries(
          Object.keys(response).map(date => ({ date: date, value: parseFloat(response[date] || 0) }))
        );
      }),
    ])
    setIsRefreshing(false);
  }

  useEffect(() => {
    getData();
  }, [])

  return (
    <main className='w-screen h-screen px-8 py-8'>
      <div className='w-full flex justify-between mb-8'>
        <h1 className='text-lg text-gray-700'>Admin</h1>
        <Button
          variant='outline'
          className={`ml-4 bg-white ${isRefreshing ? 'cursor-not-allowed' : ''}`}
          onClick={() => getData()}
          disabled={isRefreshing}
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className='grid gap-4 mb-4 grid-cols-4'>
        {['prepared_events', 'clickhouse_user_profiles', 'clickhouse_organization_profiles', 'clickhouse_organization_members'].map(queueName => (
          <div className='rounded border border-gray-200 text-gray-700 flex items-center justify-center p-4 bg-white'>
            <div className='text-center'>
              <h4 className='text-md'>{queueName} queue</h4>
              {queueStats
                ? <h1 className='text-4xl'>{queueStats[`${queueName}_count`]}</h1>
                : <Skeleton className='h-12 w-8 m-auto' />
              }
            </div>
          </div>
        ))}
      </div>
      <div className='grid gap-4 mb-4 grid-cols-4'>
        {['prepared_events_dlq', 'clickhouse_user_profiles_dlq', 'clickhouse_organization_profiles_dlq', 'clickhouse_organization_members_dlq'].map(queueName => (
          <div className='rounded border border-red-200 text-gray-700 flex items-center justify-center p-4 bg-white'>
            <div className='text-center'>
              <h4 className='text-md'>{queueName} queue</h4>
              {queueStats
                ? <h1 className='text-4xl'>{queueStats[`${queueName}_count`]}</h1>
                : <Skeleton className='h-12 w-8 m-auto' />
              }
            </div>
          </div>
        ))}
      </div>
      <LineChartWithValue
        title='Global events ingested.'
        value={eventCountsTimeseries && eventCountsTimeseries[eventCountsTimeseries.length - 1].value}
        timeseries={eventCountsTimeseries}
        groupedBy='hour'
        showAxis={true}
        showYAxis={true}
      />
      <div className='grid grid-cols-2 gap-2 mt-2'>
        <LineChartWithValue
          title='Queueing times (seconds from event occurred_at to ingested).'
          timeseries={queueingTimeTimeseries?.timeseries}
          groupedBy='minute'
          showAxis={true}
          showYAxis={true}
          dateKey='timeperiod'
          valueKey='average_seconds_to_ingest'
        />
        <LineChartWithValue
          title='Event Trigger delay (seconds from event occurred_at to triggered).'
          timeseries={eventTriggerDelayTimeTimeseries}
          groupedBy='minute'
          dateKey='date'
          valueKey='value'
          showAxis={true}
          showYAxis={true}
          connectNulls={true}
        />
      </div>
      {ingestionBatches && (
        <>
          <h1 className='text-md font-semibold mt-2'>Ingestion batches</h1>
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className='grid grid-cols-6'>
                <th scope="col" className="col-span-2 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Number of records
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Completed at
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Ingestion duration
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
                  className="group hover:bg-gray-50 duration-300 transition grid grid-cols-6 items-center"
                >
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm col-span-2">{batch.event_type}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{batch.num_records}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{new Date(batch.completed_at).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: 'numeric', minute: 'numeric' })}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{batch.num_seconds_to_complete ? intelligentlyFormattedMs(batch.num_seconds_to_complete * 1_000) : 'In progress?'}</td>
                  <td className="px-3 py-3.5 text-sm">{batch.error_message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {dataSyncs && (
        <>
          <h1 className='text-md font-semibold mt-2'>Data syncs</h1>
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className='grid grid-cols-5'>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Workspace
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Provider
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Started at
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Sync duration
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Error message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {dataSyncs.map(sync => (
                <tr
                  key={sync.id}
                  className="group hover:bg-gray-50 duration-300 transition grid grid-cols-5 items-center"
                >
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{sync.workspace.name}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{sync.provider}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{new Date(sync.started_at).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: 'numeric', minute: 'numeric' })}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">{sync.completed_at ? intelligentlyFormattedMs(sync.duration_in_seconds * 1_000) : 'In progress?'}</td>
                  <td className="px-3 py-3.5 text-sm">{sync.error_message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  )
}