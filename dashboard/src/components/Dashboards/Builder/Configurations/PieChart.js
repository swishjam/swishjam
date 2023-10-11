import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import EventAndPropertySelector from './EventAndPropertySelector';
import PieChartComponent from '@/components/Dashboards/Components/PieChart';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useState } from 'react'

export default function PieChartConfiguration({ defaultDataSource = 'all', onSaveClick = () => { } }) {
  const [chartTitle, setChartTitle] = useState();
  const [dataSource, setDataSource] = useState(defaultDataSource);
  const [errorMessage, setErrorMessage] = useState();
  const [pieChartData, setPieChartData] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [selectedEventName, setSelectedEventName] = useState();

  const renderPieChartForEventAndProperty = (eventName, propertyName) => {
    setPropertyToVisualize(propertyName);
    SwishjamAPI.Events.Properties.getCountsOfPropertyValues(eventName, propertyName).then(data => {
      setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }

  const onSave = () => {
    if (!selectedEventName) {
      setErrorMessage('Please select an event from the event dropdown.')
    } else if (!propertyToVisualize) {
      setErrorMessage(`Please select a property to visualize the values from the properties dropdown.`)
    } else {
      onSaveClick({ title: chartTitle, event: selectedEventName, property: propertyToVisualize })
    }
  }

  return (
    <>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure Pie Chart</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Chart Title' value={chartTitle} onChange={e => setChartTitle(e.target.value)} />
        </div>
      </div>
      <EventAndPropertySelector
        onEventSelected={setSelectedEventName}
        onPropertySelected={property => renderPieChartForEventAndProperty(selectedEventName, property)}
      />
      <AdvancedSettingsSection selectedDataSource={dataSource || 'all'} onDataSourceSelected={setDataSource} />
      <div className='mt-4'>
        <PieChartComponent title={chartTitle} data={pieChartData || []} keyValue='value' height={150} />
      </div>
      <div className='flex items-center justify-center text-red-500 mt-2 text-sm'>
        {errorMessage}
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