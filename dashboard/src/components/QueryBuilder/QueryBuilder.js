import { Button } from "../ui/button";
import LoadingSpinner from "../LoadingSpinner";
import QueryFilterGroupBuilder from "./QueryFilterGroupBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function QueryBuilder() {
  const [isLoading, setIsLoading] = useState(false)
  const [queryFilterGroups, setQueryFilterGroups] = useState([{ sequence_index: 1, previous_query_filter_group_relationship_operator: null, query_filters: [] }])
  const [segmentName, setSegmentName] = useState('')
  const [uniqueUserProperties, setUniqueUserProperties] = useState()
  const [uniqueEvents, setUniqueEvents] = useState()

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
    const results = await SwishjamAPI.UserSegments.create({ name: segmentName, filters: queryFilterGroups })
    console.log(results)
    setIsLoading(false)
  }

  const allFiltersComplete = queryFilterGroups.every(group => {
    return group.query_filters.every(filter => {
      return filter.type === 'QueryFilterGroups::UserProperty'
        ? filter.filter_config.user_property_name && filter.filter_config.user_property_operator && (filter.filter_config.user_property_operator === "is_defined" || filter.filter_config.user_property_operator === "is_not_defined" || filter.filter_config.user_property_value)
        : filter.filter_config.event_name && filter.filter_config.num_event_occurrences && filter.filter_config.num_lookback_days;
    })
  })

  return (
    <>
      {queryFilterGroups.map((filter, i) => (
        <div className='mt-2' key={i}>
          <QueryFilterGroupBuilder
            className='relative bg-white rounded-md border border-gray-200 px-4 py-8'
            onNewGroupClick={operator => setQueryFilterGroups([...queryFilterGroups, { sequence_index: i + 1, previous_query_filter_group_relationship_operator: operator, query_filters: [] }])}
            onDeleteClick={() => setQueryFilterGroups(queryFilterGroups.filter((_, index) => index !== i))}
            onUpdate={newConfig => {
              const newFilters = [...queryFilterGroups]
              newFilters[i].filter_config = newConfig
              setQueryFilterGroups(newFilters)
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