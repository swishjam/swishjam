import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react'
import ComboboxEvents from '@/components/utils/ComboboxEvents';
import Combobox from '@/components/utils/Combobox';
import { CalculatorIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, HashIcon, PlusIcon, TriangleAlertIcon, UserIcon, UsersIcon } from 'lucide-react';
import useCommonQueries from '@/hooks/useCommonQueries';
import { Button } from '@/components/ui/button';
import WhereClauseGroup from './WhereClauseGroup';
import LoadingSpinner from '@/components/LoadingSpinner';

const AGGREGATION_OPTIONS = [
  {
    label: 'Occurrences',
    value: 'count',
    Icon: HashIcon,
  },
  {
    label: 'Unique Users',
    value: 'users',
    Icon: UserIcon,
  },
  {
    label: 'Unique Organizations',
    value: 'organizations',
    Icon: UsersIcon,
  },
  {
    label: 'Sum',
    value: 'sum',
    Icon: PlusIcon,
    requiresPropertyOption: true,
  },
  {
    label: 'Min',
    value: 'min',
    Icon: ChevronLeftIcon,
    requiresPropertyOption: true,
  },
  {
    label: 'Max',
    value: 'max',
    Icon: ChevronRightIcon,
    requiresPropertyOption: true,
  },
  {
    label: 'Average',
    value: 'avg',
    Icon: CalculatorIcon,
    requiresPropertyOption: true,
  },
]

export default function QueryBuilder({
  config = {},
  includeUserProperties = true,
  onConfigChange,
  propertyIsRequired = false,
}) {
  const [uniquePropertiesForEvent, setUniquePropertiesForEvent] = useState();
  const {
    aggregationMethod: selectedAggregation,
    event: selectedEvent,
    property: selectedEventProperty,
    whereClauseGroups = []
  } = config;

  useEffect(() => {
    setUniquePropertiesForEvent();
    if (selectedEvent) {
      SwishjamAPI.Events.Properties.listUnique(selectedEvent).then(setUniquePropertiesForEvent);
    }
  }, [selectedEvent])

  const { uniqueEventsAndCounts, uniqueUserProperties } = useCommonQueries();
  const eventOptions = uniqueEventsAndCounts?.map(e => e.name);
  const uniqueUserPropertyOptions = uniqueUserProperties?.map(p => `user.${p}`);

  const formattedAggregationOptions = AGGREGATION_OPTIONS.map(({ label, Icon, value }) => ({
    value, label: <span className='flex items-center'><Icon className='h-3 w-3 mr-2' /> {label}</span>,
  }));

  return (
    <>
      <div className='flex text-sm text-gray-700 items-center mt-2 break-keep' >
        <div className='inline-flex items-center mx-1'>
          Visualize the
          <div className='mx-1'>
            <Combobox
              placeholder={
                <div className='flex items-center'>
                  <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
                    <TriangleAlertIcon className='h-4 w-4 mx-auto' />
                  </div>
                  Aggregation
                </div>
              }
              selectedValue={selectedAggregation}
              onSelectionChange={aggregationMethod => onConfigChange({ aggregationMethod })}
              options={formattedAggregationOptions}
            />
          </div>
          {selectedAggregation === 'users'
            ? <span className='mx-1'>who have triggered the</span>
            : <span className='mx-1'>of the</span>
          }
        </div>
        {eventOptions
          ? (
            <ComboboxEvents
              options={eventOptions || []}
              selectedValue={selectedEvent}
              placeholder={
                <div className='flex items-center'>
                  <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
                    <TriangleAlertIcon className='h-4 w-4 mx-auto' />
                  </div>
                  Event
                </div>
              }
              onSelectionChange={event => onConfigChange({ event })}
            />
          ) : <Skeleton className='h-8 w-12' />
        }

        {!propertyIsRequired
          ? <span className='mx-1'>event over time.</span>
          : (
            <>
              <span className='mx-1'>event by its {selectedEventProperty && selectedEventProperty.startsWith('user.') ? 'user\'s' : ''}</span>
              <ComboboxEvents
                selectedValue={selectedEventProperty}
                onSelectionChange={property => onConfigChange({ property })}
                swishjamEventsHeading="Event Properties"
                options={[
                  ...(uniquePropertiesForEvent || []),
                  ...(includeUserProperties ? uniqueUserPropertyOptions || [] : [])
                ]}
                placeholder={
                  !selectedEvent || uniquePropertiesForEvent
                    ? (
                      <div className='flex items-center'>
                        <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
                          <TriangleAlertIcon className='h-4 w-4 mx-auto' />
                        </div>
                        Property
                      </div>
                    ) : (
                      <div className='flex items-center'>
                        <LoadingSpinner className='h-4 w-4 mr-1' />
                        Property
                      </div>
                    )
                }
              />
              <span className='mx-1'>property over time.</span>
            </>
          )
        }
        {(whereClauseGroups.length === 0 || whereClauseGroups.every(group => group.queries.length === 0)) && (
          <Button
            className='text-gray-700'
            onClick={() => {
              onConfigChange({
                whereClauseGroups: [{
                  sequence_index: 0,
                  previous_group_operator: null,
                  queries: [{
                    previous_query_operator: null,
                    sequence_index: 0,
                    property: null,
                    operator: null,
                    value: null,
                  }],
                }]
              })
            }}
            variant='ghost'
          >
            + Filter <FilterIcon className='h-4 w-4 ml-1' />
          </Button>
        )}
      </div>
      {whereClauseGroups.length > 0 && (
        <div className='pl-10'>
          {whereClauseGroups.map((group, index) => (
            <WhereClauseGroup
              key={index}
              className='mt-2'
              group={group}
              propertyOptions={[
                ...(uniquePropertiesForEvent || []),
                ...(includeUserProperties ? uniqueUserPropertyOptions || [] : []),
              ]}
              onUpdate={newGroup => onConfigChange({ whereClauseGroups: whereClauseGroups.map((g, i) => i === index ? newGroup : g) })}
              onRemove={_group => onConfigChange({ whereClauseGroups: whereClauseGroups.filter((_, i) => i !== index) })}
            />
          ))}
        </div>
      )}
    </>
  )
}