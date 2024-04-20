import Dropdown from '@/components/utils/Dropdown'
import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react'
import ComboboxEvents from '@/components/utils/ComboboxEvents';

export default function EventAndPropertySelector({
  calculationOptions = [],
  dataSource,
  includePropertiesDropdown = true,
  includeUserProperties = false,
  onEventSelected,
  onPropertySelected,
  onCalculationSelected,
}) {
  const [selectedCalculation, setSelectedCalculation] = useState();
  const [selectedEvent, setSelectedEvent] = useState();
  const [selectedEventProperty, setSelectedEventProperty] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [uniquePropertiesForEvent, setUniquePropertiesForEvent] = useState();
  const [uniqueUserProperties, setUniqueUserProperties] = useState();

  useEffect(() => {
    SwishjamAPI.Events.listUnique({ dataSource }).then(events => {
      setUniqueEvents(events.map(e => e.name).sort((a, b) => a.localeCompare(b)));
    });
    setUniquePropertiesForEvent();
  }, [dataSource])

  useEffect(() => {
    if (includeUserProperties) {
      SwishjamAPI.Users.uniqueProperties().then(properties => setUniqueUserProperties(properties.map(p => `user.${p}`)));
    }
  }, [includeUserProperties])

  return (
    <div className='flex text-sm text-gray-700 items-center mt-2 break-keep'>
      <div className='inline-flex items-center mx-1'>
        Chart the
        {calculationOptions.length > 0
          ? (
            <div className='mx-1'>
              <Dropdown
                label={<span className='italic'>calculation</span>}
                options={calculationOptions}
                onSelect={calculation => {
                  setSelectedCalculation(calculation);
                  onCalculationSelected(calculation)
                }}
              />
            </div>
          ) : <>{' '}occurrences</>
        }
        {
          selectedCalculation === 'users'
            ? <span className='mx-1'>who have triggered the</span>
            : <span className='mx-1'>of the</span>
        }
      </div>
      {uniqueEvents
        ? (
          <ComboboxEvents
            options={uniqueEvents || []}
            selectedValue={selectedEvent}
            placeholder="Select an event"
            onSelectionChange={event => {
              setSelectedEvent(event)
              onEventSelected(event);
              SwishjamAPI.Events.Properties.listUnique(event).then(setUniquePropertiesForEvent);
            }}
          />
        ) : <Skeleton className='h-8 w-12' />
      }

      {selectedCalculation === 'count' || !includePropertiesDropdown
        ? <span className='mx-1'>event over time.</span>
        : selectedCalculation === 'users'
          ? <span className='mx-1'>the most.</span>
          : (
            <>
              <span className='mx-1'>by the {selectedEventProperty && selectedEventProperty.startsWith('user.') ? 'user' : 'event'}'s</span>
              <ComboboxEvents
                selectedValue={selectedEventProperty}
                onSelectionChange={selection => {
                  setSelectedEventProperty(selection)
                  onPropertySelected(selection)
                }}
                options={[
                  ...(uniquePropertiesForEvent || []),
                  ...(includeUserProperties ? uniqueUserProperties || [] : [])
                ]}
                placeholder="Select a property"
                swishjamEventsHeading="Event Properties"
              />
              <span className='mx-1'>property over time.</span>
            </>
          )
      }
    </div>
  )
}

{/* <div className='flex text-sm text-gray-700 items-center mt-2 break-keep'>
  <span className='mx-1'>Chart the</span>
  <Dropdown options={calculationOptions || []} onSelect={setSelectedCalculation} label='Select the calculation for the property' />
  <span className='mx-1'>of the</span>
  <Dropdown options={eventOptions} onSelect={setSelectedEventName} label='Select an event to visualize' />
  <span className='ml-1'>event</span>
  {selectedCalculation !== 'count' && (
    <>
      <span className='mr-1'>{' '}by its</span>
      <Dropdown options={propertyOptions || []} onSelect={setPropertyToVisualize} label="Select the event's property" />
      <span className='mx-1'>property.</span>
    </>
  )}
</div> */}