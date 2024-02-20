import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "../ui/input";
import LoadingSpinner from "../LoadingSpinner";
import Modal from "../utils/Modal";
import QueryFilterGroupBuilder from "./QueryFilterGroupBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

export default function QueryBuilder({
  defaultQueryFilterGroups = [{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, query_filters: [] }],
  isLoading = false,
  onSave,
}) {
  const [nameAndDescriptionModalIsOpen, setNameAndDescriptionModalIsOpen] = useState(false)
  const [queryFilterGroups, setQueryFilterGroups] = useState(defaultQueryFilterGroups)
  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')
  const [uniqueUserProperties, setUniqueUserProperties] = useState()
  const [uniqueEvents, setUniqueEvents] = useState()

  useEffect(() => {
    SwishjamAPI.Users.uniqueProperties().then(userProperties => setUniqueUserProperties([...userProperties, 'email'].sort()))
    SwishjamAPI.Events.listUnique().then(eventsAndCounts => {
      const names = eventsAndCounts.map(event => event.name)
      setUniqueEvents(names.sort())
    })
  }, [])

  if (!uniqueUserProperties || !uniqueEvents) {
    return <Skeleton className='h-10 w-20' />
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
      {nameAndDescriptionModalIsOpen && (
        <Modal onClose={() => setNameAndDescriptionModalIsOpen(false)} title='Name your segment'>
          <form onSubmit={e => {
            e.preventDefault()
            onSave({ name: segmentName, description: segmentDescription, queryFilterGroups })
          }}
          >
            <div>
              <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>Name</label>
              <Input type='text' placeholder='My segment' label='Name' value={segmentName} onChange={e => setSegmentName(e.target.value)} />
            </div>
            <div className='mt-2'>
              <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>Description</label>
              <Textarea type='textarea' placeholder='A short description of the segment.' label='Description' value={segmentDescription} onChange={e => setSegmentDescription(e.target.value)} />
            </div>
            <div className='mt-4 flex items-center justify-end space-x-4'>
              <Button
                disabled={isLoading}
                variant='swishjam'
                type='submit'
              >
                {isLoading ? <LoadingSpinner color='white' className='h-5 w-5 mx-8' /> : <>Create Segment</>}
              </Button>
            </div>
          </form>
        </Modal>
      )}
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
        {/* <Button variant='outline' disabled={!allFiltersComplete || isLoading} onClick={previewSegment}>
          {isLoading ? <LoadingSpinner color='white' className='h-5 w-5 mx-8' /> : <>Preview Segment</>}
        </Button> */}
        <Button
          variant='swishjam'
          disabled={!allFiltersComplete || isLoading}
          onClick={() => setNameAndDescriptionModalIsOpen(true)}
        >
          {isLoading ? <LoadingSpinner color='white' className='h-5 w-5 mx-8' /> : <>Create Segment</>}
        </Button>
      </div>
    </>
  )
}