import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react'
import ComboboxEvents from '@/components/utils/ComboboxEvents';
import Combobox from '@/components/utils/Combobox';
import { CalculatorIcon, ChevronLeftIcon, ChevronRightIcon, HashIcon, PlusIcon, TriangleAlertIcon } from 'lucide-react';
import useCommonQueries from '@/hooks/useCommonQueries';
import { Button } from '@/components/ui/button';
import WhereClauseGroup from './WhereClauseGroup';

const OPERATOR_ICONS = {
  count: <HashIcon className='h-3 w-3' />,
  sum: <PlusIcon className='h-3 w-3' />,
  min: <ChevronLeftIcon className='h-3 w-3' />,
  max: <ChevronRightIcon className='h-3 w-3' />,
  avg: <CalculatorIcon className='h-3 w-3' />,
}

export default function QueryBuilder({
  operatorOptions = [],
  includePropertiesDropdown = true,
  includeUserProperties = true,
  onConfigurationChange,
}) {
  const [selectedOperator, setSelectedOperator] = useState();
  const [selectedEvent, setSelectedEvent] = useState();
  const [selectedEventProperty, setSelectedEventProperty] = useState();
  const [uniquePropertiesForEvent, setUniquePropertiesForEvent] = useState();
  const [whereClauseGroups, setWhereClauseGroups] = useState([]);

  useEffect(() => {
    SwishjamAPI.Events.Properties.listUnique(selectedEvent).then(setUniquePropertiesForEvent);
  }, [selectedEvent])

  useEffect(() => {
    onConfigurationChange({
      operator: selectedOperator,
      event: selectedEvent,
      property: selectedEventProperty,
      whereClauseGroups,
    })
  }, [selectedEvent, selectedEventProperty, selectedOperator, whereClauseGroups])

  const { uniqueEventsAndCounts, uniqueUserProperties } = useCommonQueries();
  const eventOptions = uniqueEventsAndCounts?.map(e => e.name);
  const uniqueUserPropertyOptions = uniqueUserProperties?.map(p => `user.${p}`);

  const formattedOperatorOptions = operatorOptions.map(option => ({
    label: <div className='flex items-center space-x-2'>{OPERATOR_ICONS[option]} <span>{option}</span></div>,
    value: option,
  }))

  return (
    <>
      <div className='flex text-sm text-gray-700 items-center mt-2 break-keep' >
        <div className='inline-flex items-center mx-1'>
          Chart the
          {operatorOptions.length > 0
            ? (
              <div className='mx-1'>
                <Combobox
                  placeholder='operator'
                  selectedValue={selectedOperator}
                  onSelectionChange={operator => {
                    setSelectedOperator(operator);

                  }}
                  options={formattedOperatorOptions}
                />
              </div>
            ) : <>{' '}occurrences</>
          }
          {selectedOperator === 'users'
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
                  Select an event
                </div>
              }
              onSelectionChange={setSelectedEvent}
            />
          ) : <Skeleton className='h-8 w-12' />
        }

        {selectedOperator === 'count' || !includePropertiesDropdown
          ? <span className='mx-1'>event over time.</span>
          : selectedOperator === 'users'
            ? <span className='mx-1'>the most.</span>
            : (
              <>
                <span className='mx-1'>event by its {selectedEventProperty && selectedEventProperty.startsWith('user.') ? 'user\'s' : ''}</span>
                <ComboboxEvents
                  selectedValue={selectedEventProperty}
                  onSelectionChange={setSelectedEventProperty}
                  options={[
                    ...(uniquePropertiesForEvent || []),
                    ...(includeUserProperties ? uniqueUserPropertyOptions || [] : [])
                  ]}
                  placeholder={
                    <div className='flex items-center'>
                      <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
                        <TriangleAlertIcon className='h-4 w-4 mx-auto' />
                      </div>
                      Select a property
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
              setWhereClauseGroups([{
                sequence_index: 0,
                previous_group_operator: null,
                queries: [{
                  previous_query_operator: null,
                  sequence_index: 0,
                  property: null,
                  operator: null,
                  value: null,
                }],
              }])
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
              onUpdate={newGroup => setWhereClauseGroups(whereClauseGroups.map((g, i) => i === index ? newGroup : g))}
              onRemove={_group => setWhereClauseGroups(whereClauseGroups.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}
    </>
  )
}