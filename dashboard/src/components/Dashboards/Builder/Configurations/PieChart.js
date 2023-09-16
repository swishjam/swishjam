import { useState, useEffect } from 'react'
import { API } from '@/lib/api-client/base';
import Dropdown from '@/components/utils/Dropdown'
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import PieChartComponent from '@/components/Dashboards/Components/PieChart';

export default function PieChartConfiguration({ eventOptions, onSaveClick = () => {} }) {
  const [selectedEventName, setSelectedEventName] = useState();
  const [chartTitle, setChartTitle] = useState();
  const [pieChartData, setPieChartData] = useState();
  const [propertyOptions, setPropertyOptions] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const getAndSetPropertyOptionsForEvent = eventName => {
    setSelectedEventName(eventName);
    API.get(`/api/v1/events/${eventName}/properties`).then(data => {
      setPropertyOptions(data);
    });
  }

  const getAndSetValueCountsForProperty = (eventName, propertyName) => {
    setPropertyToVisualize(propertyName);
    API.get(`/api/v1/events/${eventName}/properties/${propertyName}/counts`).then(data => {
      setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }

  const onSave = () => {
    setSaveButtonText('Saving...');
    setTimeout(() => {
      setSaveButtonText(<>Saved <CheckCircleIcon className='h-4 w-4 ml-1' /></>);
      setTimeout(() => {
        onSaveClick({ title: chartTitle, event: selectedEventName, property: propertyToVisualize })
        setSaveButtonText('Save');
      }, 1_000)
    }, 500)
  }

  return (
    <>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure Pie Chart</h1>
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
        <PieChartComponent title={chartTitle} data={pieChartData || []} keyValue='value' height={150} />
      </div>
      <div className='flex justify-end mt-4'>
        <button
          className={`ml-2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
          onClick={onSave}
        >
          {saveButtonText}
        </button>
      </div>
    </>
  )
}