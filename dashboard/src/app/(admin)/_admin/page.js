'use client'

import { useEffect, useState } from 'react'
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import { intelligentlyFormattedMs } from '@/lib/utils/timeHelpers'

export default function AdminPage() {
  const [queueingData, setQueueingData] = useState();

  useEffect(() => {
    SwishjamAPI.Admin.Ingestion.queueing().then(setQueueingData);
  }, [])

  return (
    <LineChartWithValue
      title='Average time from event occurrence to ingested over the last 7 days (by minute).'
      value={queueingData && queueingData[queueingData.length - 1].value}
      timeseries={queueingData}
      groupedBy='minute'
      valueFormatter={intelligentlyFormattedMs}
      showAxis={true}
      showYAxis={true}
    />
  )
}