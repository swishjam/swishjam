import { Button } from "../ui/button";
import LoadingSpinner from "../LoadingSpinner";
import QueryFilterGroupBuilder from "./QueryFilterGroupBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function QueryBuilder({
  onCreate,
  defaultQueryFilterGroups = [{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, query_filters: [] }],
}) {
  

  const [isLoading, setIsLoading] = useState(false)
  const [queryFilterGroups, setQueryFilterGroups] = useState(defaultQueryFilterGroups)
  const [segmentName, setSegmentName] = useState('')
  const [uniqueUserProperties, setUniqueUserProperties] = useState()
  const [uniqueEvents, setUniqueEvents] = useState()

  useEffect(() => {
    setQueryFilterGroups(defaultQueryFilterGroups)
  }, [defaultQueryFilterGroups])

  useEffect(() => {
    SwishjamAPI.Users.uniqueProperties().then(userProperties => setUniqueUserProperties(userProperties.sort()))
    SwishjamAPI.Events.listUnique().then(eventsAndCounts => {
      const names = eventsAndCounts.map(event => event.name)
      setUniqueEvents(names.sort())
    })
  }, [])

  if (!uniqueUserProperties || !uniqueEvents) {
    return <Skeleton className='h-10 w-20' />
  }

  const previewSegment = async () => {
    setIsLoading(true)
    const results = await SwishjamAPI.Users.list({ filters: queryFilterGroups })
    setIsLoading(false)
  }

  const createSegment = async () => {
    setIsLoading(true)
    const { user_segment, error } = await SwishjamAPI.UserSegments.create({ name: segmentName, queryFilterGroups })
    if (error) {
      toast.error('An error occurred', {
        description: results.error,
        duration: 10_000,
      })
    } else {
      onCreate(user_segment)
    }
    setIsLoading(false)
  }

  const allFiltersComplete = true;
  // const allFiltersComplete = queryFilterGroups.every(group => {
  //   return group.query_filters.every(filter => {
  //     return filter.type === 'QueryFilterGroups::UserProperty'
  //       ? filter.config.user_property_name && filter.config.user_property_operator && (filter.config.user_property_operator === "is_defined" || filter.config.user_property_operator === "is_not_defined" || filter.config.user_property_value)
  //       : filter.config.event_name && filter.config.num_event_occurrences && filter.config.num_lookback_days;
  //   })
  // })

  return (
    <>
      {queryFilterGroups.map((filter, i) => (
        <div className='mt-4' key={i}>
          <QueryFilterGroupBuilder
            className='relative bg-white rounded-md border border-gray-200 px-4 py-8'
            onNewGroupClick={operator => setQueryFilterGroups([...queryFilterGroups, { sequence_index: i + 1, previous_query_filter_group_relationship_operator: operator, query_filters: [] }])}
            onDeleteClick={() => setQueryFilterGroups(queryFilterGroups.filter((_, index) => index !== i))}
            onUpdate={updatedQueryFiltersForGroup => {
              const newQueryFilterGroups = [...queryFilterGroups]
              newQueryFilterGroups[i].query_filters = updatedQueryFiltersForGroup
              setQueryFilterGroups(newQueryFilterGroups)
            }}
            previousQueryFilterGroupRelationshipOperator={filter.previous_query_filter_group_relationship_operator}
            showDeleteButton={i > 0}
            showNewGroupButtons={i === queryFilterGroups.length - 1}
            uniqueUserProperties={uniqueUserProperties}
            uniqueEvents={uniqueEvents}
          />
        </div >
      ))
      }
      <div className='mt-4 flex items-center justify-end space-x-4'>
        <Button variant='outline' disabled={!allFiltersComplete || isLoading} onClick={previewSegment}>
          {isLoading ? <LoadingSpinner color='white' className='h-5 w-5 mx-8' /> : <>Preview Segment</>}
        </Button>
        <Button variant='swishjam' disabled={!allFiltersComplete || isLoading} onClick={createSegment}>
          {isLoading ? <LoadingSpinner color='white' className='h-5 w-5 mx-8' /> : <>Create Segment</>}
        </Button>
      </div>
    </>
  )
}