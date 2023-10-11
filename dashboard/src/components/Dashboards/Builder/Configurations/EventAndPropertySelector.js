import Dropdown from '@/components/utils/Dropdown'
import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react'

export default function EventAndPropertySelector({
  onEventSelected,
  onPropertySelected,
  onCalculationSelected,
  calculationOptions = [],
  dataSource
}) {
  const [selectedCalculation, setSelectedCalculation] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [uniquePropertiesForEvent, setUniquePropertiesForEvent] = useState();

  useEffect(() => {
    SwishjamAPI.Events.listUnique({ dataSource }).then(setUniqueEvents);
  }, [dataSource])

  return (
    <div className='flex text-sm text-gray-700 items-center mt-2 break-keep'>
      <div className='inline-flex items-center mx-1'>
        Chart the
        {calculationOptions.length > 0
          ? (
            <div className='mx-1'>
              <Dropdown
                options={calculationOptions}
                onSelect={calculation => {
                  setSelectedCalculation(calculation);
                  onCalculationSelected(calculation)
                }}
                label={<span className='italic'>calculation</span>}
              />
            </div>
          ) : 'breakdown'
        } of the
      </div>
      {uniqueEvents
        ? (
          <Dropdown
            options={uniqueEvents}
            onSelect={event => {
              onEventSelected(event);
              SwishjamAPI.Events.Properties.listUnique(event).then(setUniquePropertiesForEvent);
            }}
            label={<span className='italic'>event</span>}
          />
        ) : <Skeleton className='h-8 w-12' />
      }

      {selectedCalculation === 'count'
        ? <span className='mx-1'>event.</span>
        : (
          <>
            <span className='mx-1'>event's</span>
            <Dropdown
              options={uniquePropertiesForEvent || []}
              onSelect={onPropertySelected}
              label={<span className='italic'>property</span>}
            />
            <span className='mx-1'>property.</span>
          </>
        )}
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