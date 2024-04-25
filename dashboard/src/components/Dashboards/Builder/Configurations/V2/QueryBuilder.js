import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react'
import ComboboxEvents from '@/components/utils/ComboboxEvents';
import Combobox from '@/components/utils/Combobox';
import { CalculatorIcon, ChevronLeftIcon, ChevronRightIcon, HashIcon, PlusIcon, TriangleAlertIcon } from 'lucide-react';
import useCommonQueries from '@/hooks/useCommonQueries';
import { Button } from '@/components/ui/button';
import WhereClauseGroup from './WhereClauseGroup';

const AGGREGATION_ICONS = {
  count: <HashIcon className='h-3 w-3' />,
  sum: <PlusIcon className='h-3 w-3' />,
  min: <ChevronLeftIcon className='h-3 w-3' />,
  max: <ChevronRightIcon className='h-3 w-3' />,
  avg: <CalculatorIcon className='h-3 w-3' />,
}

const AGGREGATION_OPTIONS = ['count', 'sum', 'min', 'max', 'avg'];

export default function QueryBuilder({
  configuration = {},
  includePropertiesDropdown = true,
  includeUserProperties = true,
  // aGGREGATION_OPTIONS = [],
  onConfigurationChange,
}) {
  const [uniquePropertiesForEvent, setUniquePropertiesForEvent] = useState();
  const {
    aggregation: selectedAggregation,
    event: selectedEvent,
    property: selectedEventProperty,
    whereClauseGroups = []
  } = configuration;

  useEffect(() => {
    SwishjamAPI.Events.Properties.listUnique(selectedEvent).then(setUniquePropertiesForEvent);
  }, [selectedEvent])

  const { uniqueEventsAndCounts, uniqueUserProperties } = useCommonQueries();
  const eventOptions = uniqueEventsAndCounts?.map(e => e.name);
  const uniqueUserPropertyOptions = uniqueUserProperties?.map(p => `user.${p}`);

  const formattedAggregationOptions = AGGREGATION_OPTIONS.map(option => ({
    label: <div className='flex items-center space-x-2'>{AGGREGATION_ICONS[option]} <span>{option}</span></div>,
    value: option,
  }))

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
              onSelectionChange={aggregation => onConfigurationChange({ aggregation })}
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
              onSelectionChange={event => onConfigurationChange({ event })}
            />
          ) : <Skeleton className='h-8 w-12' />
        }

        {selectedAggregation === 'count' || !includePropertiesDropdown
          ? <span className='mx-1'>event over time.</span>
          : selectedAggregation === 'users'
            ? <span className='mx-1'>the most.</span>
            : (
              <>
                <span className='mx-1'>event by its {selectedEventProperty && selectedEventProperty.startsWith('user.') ? 'user\'s' : ''}</span>
                <ComboboxEvents
                  selectedValue={selectedEventProperty}
                  onSelectionChange={property => onConfigurationChange({ property })}
                  options={[
                    ...(uniquePropertiesForEvent || []),
                    ...(includeUserProperties ? uniqueUserPropertyOptions || [] : [])
                  ]}
                  placeholder={
                    <div className='flex items-center'>
                      <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
                        <TriangleAlertIcon className='h-4 w-4 mx-auto' />
                      </div>
                      Property
                    </div>
                  }
                  swishjamEventsHeading="Event Properties"
                />
                <span className='mx-1'>property over time.</span>
              </>
            )
        }
        {(whereClauseGroups.length === 0 || whereClauseGroups.every(group => group.queries.length === 0)) && (
          <Button
            className='text-gray-700'
            onClick={() => {
              onConfigurationChange({
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
            + Where
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
              onUpdate={newGroup => onConfigurationChange({ whereClauseGroups: whereClauseGroups.map((g, i) => i === index ? newGroup : g) })}
              onRemove={_group => onConfigurationChange({ whereClauseGroups: whereClauseGroups.filter((_, i) => i !== index) })}
            />
          ))}
        </div>
      )}
    </>
  )
}