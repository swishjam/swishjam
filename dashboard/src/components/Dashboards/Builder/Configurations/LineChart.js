import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import EventAndPropertySelector from './EventAndPropertySelector';
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue'
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useState } from 'react'

export default function LineChartConfiguration({ defaultDataSource = 'all', onSaveClick = () => { } }) {
  const [currentValue, setCurrentValue] = useState();
  const [dataSource, setDataSource] = useState(defaultDataSource)
  const [errorMessage, setErrorMessage] = useState();
  const [lineChartData, setLineChartData] = useState();
  const [lineChartTitle, setLineChartTitle] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [selectedEventName, setSelectedEventName] = useState();
  const [selectedCalculation, setSelectedCalculation] = useState('count');

  const renderLineChartForCalcluationEventAndProperty = async (calculation, event, property) => {
    setLineChartData();
    setCurrentValue();
    SwishjamAPI.Events.timeseries(event).then(timeseries => {
      setLineChartData(timeseries);
      setCurrentValue(timeseries[timeseries.length - 1].value);
    })
  }

  const onFormSubmit = e => {
    e.preventDefault();
    if (!selectedCalculation) {
      setErrorMessage('Please select a calculation to use from the event dropdown.')
    } else if (!selectedEventName) {
      setErrorMessage('Please select an event to chart from the event dropdown.')
    } else if (selectedCalculation !== 'count' && !propertyToVisualize) {
      setErrorMessage('Please select a property to use from the property dropdown.')
    } else {
      onSaveClick({ title: lineChartTitle, event: selectedEventName, property: propertyToVisualize, calculation: selectedCalculation });
    }
  }

  return (
    <form onSubmit={onFormSubmit}>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure LineChart</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Line Chart Title' value={lineChartTitle} onChange={e => setLineChartTitle(e.target.value)} />
        </div>
      </div>
      <EventAndPropertySelector
        calculationOptions={['count', 'sum', 'avg', 'min', 'max']}
        onCalculationSelected={setSelectedCalculation}
        onEventSelected={event => {
          setSelectedEventName(event)
          if (selectedCalculation === 'count') {
            renderLineChartForCalcluationEventAndProperty(selectedCalculation, event)
          }
        }}
        onPropertySelected={property => {
          setPropertyToVisualize(property);
          renderLineChartForCalcluationEventAndProperty(selectedCalculation, selectedEventName, property)
        }}
      />
      <AdvancedSettingsSection selectedDataSource={dataSource || 'all'} onDataSourceSelected={setDataSource} />
      <div className='mt-4'>
        <LineChartWithValue title={lineChartTitle} timeseries={lineChartData} value={currentValue} />
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