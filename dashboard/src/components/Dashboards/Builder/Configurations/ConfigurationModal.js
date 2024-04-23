import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import EventAndPropertySelector from './EventAndPropertySelector';
import { useState } from 'react'
import { Input } from '@/components/ui/input';

export default function ConfigurationModal({
  AdditionalSettings = <></>,
  calculationOptions = ['count', 'sum', 'avg', 'min', 'max'],
  defaultDataSource = 'all',
  description,
  includeCalculationsDropdown,
  includePropertiesDropdown = true,
  includeSubtitleInput = true,
  includeUserProperties = false,
  onConfigurationChange,
  onSave = () => { },
  previewDashboardComponent,
}) {
  const [dataSourceToPullFrom, setDataSourceToPullFrom] = useState(defaultDataSource)
  const [errorMessage, setErrorMessage] = useState();
  const [selectedPropertyName, setSelectedPropertyName] = useState();
  const [selectedEventName, setSelectedEventName] = useState();
  const [selectedCalculation, setSelectedCalculation] = useState(includeCalculationsDropdown ? null : 'count');
  const [subtitle, setSubtitle] = useState();
  const [title, setTitle] = useState();

  const onFormSubmit = e => {
    e.preventDefault();
    if (!selectedCalculation && includeCalculationsDropdown) {
      setErrorMessage('Please select a calculation to use from the event dropdown.')
    } else if (!selectedEventName) {
      setErrorMessage('Please select an event to chart from the event dropdown.')
    } else if (selectedCalculation !== 'count' && !selectedPropertyName) {
      setErrorMessage('Please select a property to use from the property dropdown.')
    } else {
      onSave({ title, subtitle, event: selectedEventName, property: selectedPropertyName, calculation: selectedCalculation, dataSource: dataSourceToPullFrom });
    }
  }

  return (
    <form onSubmit={onFormSubmit}>
      <div className='max-h-[75vh] overflow-y-scroll pb-4 px-1'>
        <h2 className='text-sm text-gray-500 mb-4'>{description}</h2>
        <Input id='title' className='w-1/2' placeholder='Title *' value={title} onChange={e => setTitle(e.target.value)} />
        {includeSubtitleInput && (
          <Input id='subtitle' className='w-3/4 mt-1' placeholder='Subtitle' value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        )}
        <EventAndPropertySelector
          calculationOptions={includeCalculationsDropdown ? calculationOptions : []}
          dataSource={dataSourceToPullFrom}
          includePropertiesDropdown={includePropertiesDropdown}
          includeUserProperties={includeUserProperties}
          onCalculationSelected={calculation => {
            setSelectedCalculation(calculation);
            onConfigurationChange({
              calculation,
              eventName: selectedEventName,
              propertyName: selectedPropertyName,
              dataSource: dataSourceToPullFrom
            });
          }}
          onEventSelected={event => {
            setSelectedEventName(event)
            onConfigurationChange({
              calculation: selectedCalculation,
              eventName: event,
              propertyName: selectedPropertyName,
              dataSource: dataSourceToPullFrom
            });
          }}
          onPropertySelected={property => {
            setSelectedPropertyName(property);
            onConfigurationChange({
              calculation: selectedCalculation,
              eventName: selectedEventName,
              propertyName: property,
              dataSource: dataSourceToPullFrom
            });
          }}
        />
        <AdvancedSettingsSection
          selectedDataSource={dataSourceToPullFrom}
          onDataSourceSelected={dataSource => {
            setDataSourceToPullFrom(dataSource)
            onConfigurationChange({
              calculation: selectedCalculation,
              eventName: selectedEventName,
              propertyName: selectedPropertyName,
              dataSource
            })
          }}
        >
          {AdditionalSettings}
        </AdvancedSettingsSection>
        <div className='mt-4'>
          {previewDashboardComponent(title, subtitle)}
        </div>
      </div>
      <div className='flex items-center justify-center text-red-500 mt-2 text-sm'>
        {errorMessage}
      </div>
      <div className='flex justify-end mt-4 border-t border-gray-200 pt-4'>
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