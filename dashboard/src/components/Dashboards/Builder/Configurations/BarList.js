
import AdvancedSettingsSection from "@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection";
import { Button } from "@/components/ui/button"
import BarList from '@/components/Dashboards/Components/BarList';
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function BarListConfiguration({ onConfigurationSave = () => { } }) {
  const [barColorConfig, setBarColorConfig] = useState('rgb(186 230 253 )');
  const [barListData, setBarListData] = useState();
  const [dataSourceToPullFrom, setDataSourceToPullFrom] = useState('all')
  const [errorMessage, setErrorMessage] = useState();
  const [uniquePropertiesForEvent, setUniquePropertiesForEvent] = useState();
  const [selectedCalculation, setSelectedCalculation] = useState();
  const [selectedEventName, setSelectedEventName] = useState();
  const [selectedPropertyName, setSelectedPropertyName] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [title, setTitle] = useState();

  const onFormSubmit = e => {
    e.preventDefault();
    if (!selectedCalculation) {
      setErrorMessage('Please select a calculation to use from the event dropdown.')
    } else if (!selectedEventName) {
      setErrorMessage('Please select an event to chart from the event dropdown.')
    } else if (selectedCalculation === 'occurrences' && !selectedPropertyName) {
      setErrorMessage('Please select a property to use from the property dropdown.')
    } else {
      onConfigurationSave({
        title,
        event: selectedEventName,
        property: selectedPropertyName,
        calculation: selectedCalculation,
        dataSource: dataSourceToPullFrom,
        barColor: barColorConfig
      });
    }
  }

  const tryToGetBarListData = ({ eventName, propertyName, calculation, dataSource }) => {
    setBarListData();
    if (calculation === 'occurrences' && eventName && propertyName) {
      SwishjamAPI.Events.Properties.getCountsOfPropertyValues(eventName, propertyName, { dataSource }).then(data => {
        setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
      })
    } else if (calculation === 'users' && eventName) {
      SwishjamAPI.Events.Users.list(eventName, { dataSource, limit: 10 }).then(data => {
        const formattedData = data.map(({ user_profile_id, email, metadata, count }) => {
          return {
            name: email || <span className='italic'>Anonymous User {user_profile_id.slice(0, 6)}</span>,
            value: count,
            href: `/users/${user_profile_id}`
          }
        })
        setBarListData(formattedData);
      })
    }
  }

  const onPropertySelected = property => {
    setSelectedPropertyName(property);
    tryToGetBarListData({ eventName: selectedEventName, propertyName: property, calculation: selectedCalculation, dataSource: dataSourceToPullFrom });
  }

  const onCalculationSelected = calculation => {
    setSelectedCalculation(calculation);
    tryToGetBarListData({ eventName: selectedEventName, propertyName: selectedPropertyName, calculation, dataSource: dataSourceToPullFrom });
  }

  const onEventSelected = event => {
    setSelectedEventName(event);
    SwishjamAPI.Events.Properties.listUnique(event).then(properties => {
      setUniquePropertiesForEvent(properties.sort((a, b) => a.localeCompare(b)))
    });
    tryToGetBarListData({ eventName: event, propertyName: selectedPropertyName, calculation: selectedCalculation, dataSource: dataSourceToPullFrom });
  }

  useEffect(() => {
    SwishjamAPI.Events.listUnique({ dataSource: dataSourceToPullFrom }).then(events => {
      setUniqueEvents(
        events.sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  }, [])

  return (
    <form onSubmit={onFormSubmit}>
      <h1 className='text-lg font-medium text-gray-700'>Bar List Configuration</h1>
      <h2 className='text-sm text-gray-500 mb-4'>Visualize data in an itemized list</h2>
      <div className='grid grid-cols-2 gap-4 items-center'>
        <div>
          <input className='input' placeholder='Bar List Title' value={title} onChange={e => setTitle(e.target.value)} />
        </div>
      </div>
      <div className='flex text-sm text-gray-700 items-center mt-2 break-keep'>
        <div className='inline-flex items-center mx-1'>
          Chart the
          <div className='mx-1'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className='font-normal text-gray-700'>
                  {selectedCalculation || <span className='italic'>calculation</span>}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit">
                <DropdownMenuLabel>Calculation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedCalculation} onValueChange={onCalculationSelected}>
                  <DropdownMenuRadioItem className='hover:bg-gray-100 cursor-pointer' value="occurrences">
                    Occurrences
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='hover:bg-gray-100 cursor-pointer' value="users">
                    Users
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {
            selectedCalculation === 'users'
              ? <span className='mx-1'>who have triggered the</span>
              : <span className='mx-1'>of the</span>
          }
        </div>
        {uniqueEvents
          ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className='font-normal text-gray-700'>
                  {selectedEventName || <span className='italic'>event</span>}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit max-h-72 overflow-y-scroll">
                <DropdownMenuLabel>Event</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedEventName} onValueChange={onEventSelected}>
                  {uniqueEvents.map(event => (
                    <DropdownMenuRadioItem className='hover:bg-gray-100 cursor-pointer' value={event.name}>
                      {event.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : <Skeleton className='h-8 w-12' />
        }

        {selectedCalculation === 'count'
          ? <span className='mx-1'>event over time.</span>
          : selectedCalculation === 'users'
            ? <span className='mx-1'>event the most.</span>
            : (
              <>
                <span className='mx-1'>by the</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='font-normal text-gray-700'>
                      {selectedPropertyName || <span className='italic'>property</span>}
                      <ChevronDownIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit max-h-72 overflow-scroll">
                    <DropdownMenuLabel>Property</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedEventName} onValueChange={onPropertySelected}>
                      {uniquePropertiesForEvent
                        ? (
                          uniquePropertiesForEvent.map(property => (
                            <DropdownMenuRadioItem className='hover:bg-gray-100 cursor-pointer' value={property}>
                              {property}
                            </DropdownMenuRadioItem>
                          ))
                        ) : <Skeleton className='h-8 w-12' />
                      }
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className='mx-1'>property.</span>
              </>
            )
        }
      </div>
      <AdvancedSettingsSection selectedDataSource={dataSourceToPullFrom} onDataSourceSelected={setDataSourceToPullFrom}>
        <div className='flex items-center space-x-2 mt-2'>
          <Label className='font-normal'>Bar Color</Label>
          <div className='flex space-x-2'>
            {['rgb(186 230 253 )', '#ff0422', '#F5A623', '#F8E71C', '#cb8447', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#4A4A4A', '#9B9B9B'].map(color => (
              <div
                key={color}
                className={`cursor-pointer w-6 h-6 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 ${barColorConfig === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                onClick={() => setBarColorConfig(color)}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </AdvancedSettingsSection>
      <div className='mt-4'>
        <BarList title={title} items={barListData} color={barColorConfig} />
      </div>
      <div className='flex items-center justify-center text-red-500 mt-2 text-sm'>
        {errorMessage}
      </div>
      <div className='flex justify-end mt-4'>
        <button
          className='ml-2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
          type='submit'
        >
          Save
        </button>
      </div>
    </form>
  )
}