import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import EventAndPropertySelector from '@/components/Dashboards/Builder/Configurations/EventAndPropertySelector';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useState } from 'react'
import ValueCard from '@/components/Dashboards/Components/ValueCard';

export default function LineChartConfiguration({ defaultDataSource = 'all', onSaveClick = () => { } }) {
  const [chartTitle, setChartTitle] = useState();
  const [dataSource, setDataSource] = useState(defaultDataSource);
  const [errorMessage, setErrorMessage] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [selectedCalculation, setSelectedCalculation] = useState('count');
  const [selectedEventName, setSelectedEventName] = useState();
  const [valueCardValue, setValueCardValue] = useState();
  const [valueCardPreviousValue, setValueCardPreviousValue] = useState();

  const setEventNameAndGetPropertiesOrSetValueCounts = async eventName => {
    setSelectedEventName(eventName);
    if (selectedCalculation === 'count') {
      return SwishjamAPI.Events.count().then(({ count, comparison_count }) => {
        setValueCardValue(count);
        setValueCardPreviousValue(comparison_count);
      });
    } else {
      // TODO: Need to take into account other calculation types
      return SwishjamAPI.Events.Properties.listUnique(eventName).then(setPropertyOptions);
    }
  }

  const setPropertyToVisualizeAndCalculateValue = propertyName => {
    setPropertyToVisualize(propertyName);
    // todo: support the other calculation types
  }

  const onSubmit = async e => {
    e.preventDefault();
    if (!selectedCalculation) {
      setErrorMessage('Please select a calculation from the calculation dropdown.')
    } else if (!selectedEventName) {
      setErrorMessage('Please select an event from the event dropdown.')
    } else if (selectedCalculation !== 'count' && propertyToVisualize) {
      setErrorMessage('Please select an event property from the property dropdown.')
    } else {
      onSaveClick({ title: chartTitle, event: selectedEventName, property: propertyToVisualize, calculation: selectedCalculation });
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure Value Card</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Line Chart Title' value={chartTitle} onChange={e => setChartTitle(e.target.value)} />
        </div>
      </div>
      <EventAndPropertySelector
        calculationOptions={['count', 'sum', 'avg', 'min', 'max']}
        onCalculationSelected={setSelectedCalculation}
        onEventSelected={setEventNameAndGetPropertiesOrSetValueCounts}
        onPropertySelected={setPropertyToVisualizeAndCalculateValue}
      />
      <AdvancedSettingsSection selectedDataSource={dataSource || 'all'} onDataSourceSelected={setDataSource} />
      <div className='mt-4'>
        <ValueCard title={chartTitle} value={valueCardValue} previousValue={valueCardPreviousValue} />
      </div>
      <div className='flex items-center justify-center text-red-500 mt-2 text-sm'>
        {errorMessage}
      </div>
      <div className='flex justify-end mt-4'>
        <button
          className={`ml-2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
          type='submit'
        >
          Save
        </button>
      </div>
    </form>
  )
}