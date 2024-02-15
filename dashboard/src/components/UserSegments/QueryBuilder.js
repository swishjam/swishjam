import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import UserSegmentFilterConfiguration from "./UserSegmentFilterConfiguration";
import { Button } from "../ui/button";
import LoadingSpinner from "../LoadingSpinner";

export default function QueryBuilder() {
  const [isLoading, setIsLoading] = useState(false)
  const [segmentFilters, setSegmentFilters] = useState([{ sequence_position: 1, parent_relationship_operator: null, filter_config: {} }])
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
    const results = await SwishjamAPI.Users.list({ filters: segmentFilters })
    setIsLoading(false)
  }

  const createSegment = async () => {
    setIsLoading(true)
    const results = await SwishjamAPI.UserSegments.create({ name: segmentName, filters: segmentFilters })
    console.log(results)
    setIsLoading(false)
  }

  const allFiltersComplete = segmentFilters.every(filter => {
    return filter.filter_config.object_type === 'user'
      ? filter.filter_config.user_property_name && filter.filter_config.user_property_operator && (filter.filter_config.user_property_operator === "is_defined" || filter.filter_config.user_property_operator === "is_not_defined" || filter.filter_config.user_property_value)
      : filter.filter_config.event_name && filter.filter_config.num_event_occurrences && filter.filter_config.num_lookback_days;
  })

  return (
    <>
      {segmentFilters.map((filter, i) => (
        <div className='mt-2' key={i}>
          <UserSegmentFilterConfiguration
            displayAndOrButtons={i === segmentFilters.length - 1}
            displayDeleteButton={i > 0}
            onAndClick={() => setSegmentFilters([...segmentFilters, { sequence_position: i + 2, parent_relationship_operator: 'and', filter_config: {} }])}
            onDelete={() => setSegmentFilters(segmentFilters.filter((_, index) => index !== i))}
            onOrClick={() => setSegmentFilters([...segmentFilters, { sequence_position: i + 2, parent_relationship_operator: 'or', filter_config: {} }])}
            onUpdate={newConfig => {
              const newFilters = [...segmentFilters]
              newFilters[i].filter_config = newConfig
              setSegmentFilters(newFilters)
            }}
            operator={filter.parent_relationship_operator}
            uniqueUserProperties={uniqueUserProperties}
            uniqueEvents={uniqueEvents}
          />
        </div>
      ))}
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