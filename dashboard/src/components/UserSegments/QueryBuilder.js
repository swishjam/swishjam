import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import UserSegmentFamilyRow from "./UserSegmentFamilyRow";

export default function QueryBuilder() {
  const [uniqueUserProperties, setUniqueUserProperties] = useState()
  const [uniqueEvents, setUniqueEvents] = useState()

  useEffect(() => {
    SwishjamAPI.Users.uniqueProperties().then(setUniqueUserProperties)
    SwishjamAPI.Events.listUnique().then(eventsAndCounts => {
      const names = eventsAndCounts.map(event => event.name)
      setUniqueEvents(names)
    })
  }, [])

  if (!uniqueUserProperties || !uniqueEvents) {
    return <Skeleton className='h-10 w-20' />
  }

  return (
    <>
      <UserSegmentFamilyRow
        uniqueUserProperties={uniqueUserProperties}
        uniqueEvents={uniqueEvents}
      />
    </>
  )
}