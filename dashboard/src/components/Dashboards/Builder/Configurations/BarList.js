import { useState } from 'react'
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import Dropdown from '@/components/utils/Dropdown'
import BarListComponent from '@/components/Dashboards/Components/BarList';

export default function BarListConfiguration({ eventOptions, onSaveClick = () => { } }) {
  const [selectedEventName, setSelectedEventName] = useState();
  const [chartTitle, setChartTitle] = useState();
  const [barListData, setBarListData] = useState();
  const [propertyOptions, setPropertyOptions] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();

  const getAndSetPropertyOptionsForEvent = eventName => {
    setSelectedEventName(eventName);
    SwishjamAPI.Events.Properties.list(eventName).then(data => {
      setPropertyOptions(data);
    });
  }

  const getAndSetValueCountsForProperty = (eventName, propertyName) => {
    setPropertyToVisualize(propertyName);
    SwishjamAPI.Events.Properties.getCountsOfPropertyValues(eventName, propertyName).then(data => {
      setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }

  const onSave = () => {
    onSaveClick({ title: chartTitle, event: selectedEventName, property: propertyToVisualize })
  }

  return (
    <>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure Bar List</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Chart Title' value={chartTitle} onChange={e => setChartTitle(e.target.value)} />
        </div>
      </div>
      <div className='flex text-sm text-gray-700 items-center mt-2 break-keep'>
        <span className='mx-1'>Chart the breakdown of the</span>
        <Dropdown options={eventOptions} onSelect={getAndSetPropertyOptionsForEvent} label='Select an event to visualize' />
        <span className='mx-1'>event's</span>
        <Dropdown
          options={propertyOptions || []}
          onSelect={propertyName => getAndSetValueCountsForProperty(selectedEventName, propertyName)}
          label="Select the event's property"
        />
        <span className='mx-1'>property.</span>
      </div>
      <div className='mt-4'>
        <BarListComponent title={chartTitle} items={barListData} />
      </div>
      <div className='flex justify-end mt-4'>
        <button
          className={`ml-2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </>
  )
}