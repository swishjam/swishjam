import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import NameAndDescriptionModal from "./NameAndDescriptionModal";
import QueryFilterGroupBuilder from "./QueryFilterGroupBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function QueryBuilder({
  defaultSegmentName = '',
  defaultSegmentDescription = '',
  defaultQueryFilterGroups = [{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, query_filters: [] }],
  isLoading = false,
  onSave,
  onPreview,
  saveButtonText = 'Create Segment',
}) {
  const [errorMessage, setErrorMessage] = useState()
  const [nameAndDescriptionModalIsOpen, setNameAndDescriptionModalIsOpen] = useState(false)
  const [queryFilterGroups, setQueryFilterGroups] = useState(defaultQueryFilterGroups)
  const [segmentName, setSegmentName] = useState(defaultSegmentName)
  const [segmentDescription, setSegmentDescription] = useState(defaultSegmentDescription)
  const [uniqueUserProperties, setUniqueUserProperties] = useState()
  const [uniqueEvents, setUniqueEvents] = useState()

  if (defaultQueryFilterGroups === undefined || uniqueUserProperties === undefined || uniqueEvents === undefined) {
    <div className='relative bg-white rounded-md border border-gray-200 px-4 py-8'>
      <Skeleton className='h-10 w-20' />
      <Skeleton className='h-10 w-20' />
      <Skeleton className='h-10 w-20' />
    </div>
  }

  useEffect(() => {
    SwishjamAPI.Users.uniqueProperties().then(userProperties => setUniqueUserProperties([...userProperties, 'email'].sort()))
    SwishjamAPI.Events.listUnique().then(eventsAndCounts => {
      const names = eventsAndCounts.map(event => event.name)
      setUniqueEvents(names.sort())
    })
  }, [])

  const allFiltersComplete = queryFilterGroups.every(group => {
    return group.query_filters.every(filter => {
      if (filter.type === 'QueryFilters::UserProperty') {
        return filter.config.property_name && filter.config.operator && (['is_defined', 'is_not_defined', 'is_generic_email', 'is_not_generic_email'].includes(filter.config.operator) || filter.config.user_property_operator === "is_not_defined" || filter.config.property_value)
      } else if (filter.type === 'QueryFilters::EventCountForUserOverTimePeriod') {
        return filter.config.event_name && filter.config.num_occurrences && filter.config.num_lookback_days;
      } else {
        return false;
      }
    })
  })

  return (
    <>
      <NameAndDescriptionModal
        defaultName={segmentName}
        defaultDescription={segmentDescription}
        isOpen={nameAndDescriptionModalIsOpen}
        onClose={() => setNameAndDescriptionModalIsOpen(false)}
        onSave={({ name, description }) => {
          setNameAndDescriptionModalIsOpen(false)
          onSave({ name, description, queryFilterGroups })
        }}
      />
      {queryFilterGroups.map((filter, i) => (
        <div className='mt-4' key={i}>
          <QueryFilterGroupBuilder
            className='relative bg-white rounded-md border border-gray-200 px-4 py-8'
            defaultFilters={filter.query_filters}
            hasGroupAfter={i < queryFilterGroups.length - 1}
            onNewGroupClick={operator => {
              setQueryFilterGroups([...queryFilterGroups, { sequence_index: i + 1, previous_query_filter_group_relationship_operator: operator, query_filters: [{ sequence_index: 0, previous_query_filter_relationship_operator: null, config: {} }] }])
            }}
            onDeleteClick={() => setQueryFilterGroups(queryFilterGroups.filter((_, index) => index !== i))}
            onUpdate={updatedQueryFiltersForGroup => {
              const newQueryFilterGroups = [...queryFilterGroups]
              newQueryFilterGroups[i].query_filters = updatedQueryFiltersForGroup
              setQueryFilterGroups(newQueryFilterGroups)
              if (allFiltersComplete) setErrorMessage(null)
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
      <div className='mt-4'>
        {errorMessage && <p className='text-red-500 text-sm text-center'>{errorMessage}</p>}
        <div className='flex items-center justify-end space-x-4'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => {
              if (!allFiltersComplete) {
                setErrorMessage('Please complete all filters before previewing.')
              } else {
                setErrorMessage(null)
                onPreview(queryFilterGroups)
              }
            }}
          >
            {isLoading ? <LoadingSpinner center={true} className='h-5 w-5 mx-8' /> : <>Preview Segment</>}
          </Button>
          <Button
            variant='swishjam'
            disabled={isLoading}
            onClick={() => {
              if (!allFiltersComplete) {
                setErrorMessage('Please complete all filters before saving.')
              } else {
                setErrorMessage(null)
                if ((!segmentName || segmentName === '') && (!segmentDescription || segmentDescription === '')) {
                  setNameAndDescriptionModalIsOpen(true)
                } else {
                  onSave({ name: segmentName, description: segmentDescription, queryFilterGroups })
                }
              }
            }}
          >
            {isLoading ? <LoadingSpinner center={true} color='white' className='h-5 w-5 mx-8' /> : saveButtonText}
          </Button>
        </div>
      </div>
    </>
  )
}