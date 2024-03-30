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
  saveButtonText = 'Create Cohort',
}) {
  const [errorMessages, setErrorMessages] = useState([])
  const [nameAndDescriptionModalIsOpen, setNameAndDescriptionModalIsOpen] = useState(false)
  const [queryFilterGroups, setQueryFilterGroups] = useState(defaultQueryFilterGroups)
  const [segmentName, setSegmentName] = useState(defaultSegmentName)
  const [segmentDescription, setSegmentDescription] = useState(defaultSegmentDescription)
  const [uniqueUserProperties, setUniqueUserProperties] = useState()
  const [uniqueEvents, setUniqueEvents] = useState()
  const [uniqueOrganizationProperties, setUniqueOrganizationProperties] = useState()

  if (defaultQueryFilterGroups === undefined || uniqueUserProperties === undefined || uniqueEvents === undefined) {
    <div className='relative bg-white rounded-md border border-gray-200 px-4 py-8'>
      <Skeleton className='h-10 w-20' />
      <Skeleton className='h-10 w-20' />
      <Skeleton className='h-10 w-20' />
    </div>
  }

  useEffect(() => {
    SwishjamAPI.Organizations.uniqueProperties().then(orgProperties => setUniqueOrganizationProperties(orgProperties.sort()))
    SwishjamAPI.Users.uniqueProperties().then(userProperties => setUniqueUserProperties([...userProperties, 'email'].sort()))
    SwishjamAPI.Events.listUnique().then(eventsAndCounts => {
      const names = eventsAndCounts.map(event => event.name)
      setUniqueEvents(names.sort())
    })
  }, [])

  const errorsForQueryFilterGroups = groups => {
    let errorMessagess = []
    groups.forEach((group, groupIndex) => {
      return group.query_filters.forEach((filter, filterIndex) => {
        if (filter.type === 'QueryFilters::UserProperty') {
          if (!filter.config.property_name) {
            errorMessagess.push(`Please select a property value for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
          if (!filter.config.operator) {
            errorMessagess.push(`Please select an operator for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
          if (!['is_defined', 'is_not_defined', 'is_generic_email', 'is_not_generic_email'].includes(filter.config.operator) && !filter.config.property_value) {
            errorMessagess.push(`Please enter an expected value for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
        } else if (filter.type === 'QueryFilters::EventCountForUserOverTimePeriod') {
          if (!filter.config.event_name) {
            errorMessagess.push(`Please select an event for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
          if (filter.config.num_occurrences === undefined) {
            errorMessagess.push(`Please enter the number of occurrences for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
          if (filter.config.num_lookback_days === undefined) {
            errorMessagess.push(`Please enter the number of lookback days for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
          if (!filter.config.event_count_operator) {
            errorMessagess.push(`Please select an event count operator for filter #${filterIndex + 1}${groups.length > 1 ? ` in group #${groupIndex + 1}` : ''}.`)
          }
        } else {
          throw new Error(`Unknown filter type: ${filter.type}`)
        }
      })
    })
    return errorMessagess;
  }

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
              setErrorMessages([])
            }}
            previousQueryFilterGroupRelationshipOperator={filter.previous_query_filter_group_relationship_operator}
            showDeleteButton={i > 0}
            showNewGroupButtons={i === queryFilterGroups.length - 1}
            uniqueUserProperties={uniqueUserProperties}
            uniqueOrganizationProperties={uniqueOrganizationProperties}
            uniqueEvents={uniqueEvents}
          />
        </div >
      ))
      }
      <div className='mt-4'>
        {errorMessages.map(e => <p className='text-red-500 text-sm text-center'>{e}</p>)}
        <div className='flex items-center justify-end space-x-4'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => {
              const errors = errorsForQueryFilterGroups(queryFilterGroups)
              if (errors.length > 0) {
                setErrorMessages(errors)
              } else {
                setErrorMessages([])
                onPreview(queryFilterGroups)
              }
            }}
          >
            {isLoading ? <LoadingSpinner center={true} className='h-5 w-5 mx-8' /> : <>Preview Cohort</>}
          </Button>
          <Button
            variant='swishjam'
            disabled={isLoading}
            onClick={() => {
              const errors = errorsForQueryFilterGroups(queryFilterGroups)
              if (errors.length > 0) {
                setErrorMessages(errors)
              } else {
                setErrorMessages([])
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