'use client'

import LiveEventsFeed from "@/components/Dashboards/DataVisualizations/LiveEventsFeed"
import PageWithHeader from "@/components/utils/PageWithHeader"

export default function LiveEventsPage() {
  return (
    <PageWithHeader title='Event Feed'>
      <LiveEventsFeed />
    </PageWithHeader>
  )
}