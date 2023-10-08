import { useState } from 'react'
import { API } from '@/lib/api-client/base';
import ValueCard from '@/components/Dashboards/Components/ValueCard';
import Dropdown from '@/components/utils/Dropdown'

export default function LineChartConfiguration({ eventOptions, onSaveClick = () => { } }) {
  const [selectedEventName, setSelectedEventName] = useState();
  const [chartTitle, setChartTitle] = useState();
  const [valueCardValue, setValueCardValue] = useState();
  const [valueCardPreviousValue, setValueCardPreviousValue] = useState();
  const [propertyOptions, setPropertyOptions] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [selectedCalculation, setSelectedCalculation] = useState('count');
  const calculationOptions = ['count', 'sum', 'avg', 'min', 'max'];

  const onSave = () => {
    onSaveClick({ title: chartTitle, event: selectedEventName, property: propertyToVisualize, calculation: selectedCalculation });
  }

  const setEventNameAndGetPropertiesOrSetValueCounts = eventName => {
    setSelectedEventName(eventName);
    if (selectedCalculation === 'count') {
      API.get(`/api/v1/events/${eventName}/count`).then(({ count, comparison_count }) => {
        setValueCardValue(count);
        setValueCardPreviousValue(comparison_count);
      });
    } else {
      API.get(`/api/v1/events/${eventName}/properties`).then(setPropertyOptions);
    }
  }

  const setPropertyToVisualizeAndCalculateValue = propertyName => {
    setPropertyToVisualize(propertyName);
    // todo: support the other calculation types
  }

  return (
    <>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure Value Card</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Line Chart Title' value={chartTitle} onChange={e => setChartTitle(e.target.value)} />
        </div>
      </div>
      <div className='flex text-sm text-gray-700 items-center mt-2 break-keep'>
        <span className='mx-1'>Display the</span>
        <Dropdown options={calculationOptions || []} onSelect={setSelectedCalculation} label='Select the calculation for the property' />
        <span className='mx-1'>of the</span>
        <Dropdown options={eventOptions} onSelect={setEventNameAndGetPropertiesOrSetValueCounts} label='Select an event to visualize' />
        <span className='ml-1'>event</span>
        {selectedCalculation !== 'count' && (
          <>
            <span className='mr-1'>{' '}by its</span>
            <Dropdown options={propertyOptions || []} onSelect={setPropertyToVisualizeAndCalculateValue} label="Select the event's property" />
            <span className='mx-1'>property.</span>
          </>
        )}
      </div>
      <div className='mt-4'>
        <ValueCard title={chartTitle} value={valueCardValue} previousValue={valueCardPreviousValue} />
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