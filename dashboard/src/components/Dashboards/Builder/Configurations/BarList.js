import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import BarListComponent from '@/components/Dashboards/Components/BarList';
import EventAndPropertySelector from '@/components/Dashboards/Builder/Configurations/EventAndPropertySelector';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useState } from 'react'

export default function BarListConfiguration({ defaultDataSource = 'all', onSaveClick = () => { } }) {
  const [barListData, setBarListData] = useState();
  const [chartTitle, setChartTitle] = useState();
  const [dataSource, setDataSource] = useState(defaultDataSource);
  const [errorMessage, setErrorMessage] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [selectedEventName, setSelectedEventName] = useState();

  const renderBarListForEventAndProperty = (eventName, propertyName) => {
    setPropertyToVisualize(propertyName);
    SwishjamAPI.Events.Properties.getCountsOfPropertyValues(eventName, propertyName, { dataSource }).then(data => {
      setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }

  const onSave = e => {
    e.preventDefault();
    if (!selectedEventName) {
      setErrorMessage('Please select an event from the event dropdown.')
    } else if (!propertyToVisualize) {
      setErrorMessage(`Please select a property to visualize the values from the properties dropdown.`)
    } else {
      onSaveClick({ title: chartTitle, event: selectedEventName, property: propertyToVisualize, dataSource })
    }
  }

  return (
    <form onSubmit={onSave}>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure Bar List</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Chart Title' value={chartTitle} onChange={e => setChartTitle(e.target.value)} />
        </div>
      </div>
      <EventAndPropertySelector
        onEventSelected={setSelectedEventName}
        onPropertySelected={property => renderBarListForEventAndProperty(selectedEventName, property)}
        dataSource={dataSource}
      />
      <AdvancedSettingsSection selectedDataSource={dataSource || 'all'} onDataSourceSelected={setDataSource} />
      <div className='mt-4'>
        <BarListComponent title={chartTitle} items={barListData} />
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
    </form>
  )
}