import { useState, useEffect } from 'react'
import { API  } from '@/lib/api-client/base';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue'
import Dropdown from '@/components/utils/Dropdown'

export default function LineChartConfiguration({ eventOptions, onSaveClick = () => {} }) {
  const [selectedEventName, setSelectedEventName] = useState();
  const [lineChartTitle, setLineChartTitle] = useState();
  const [lineChartData, setLineChartData] = useState();
  const [propertyOptions, setPropertyOptions] = useState();
  const [propertyToVisualize, setPropertyToVisualize] = useState();
  const [selectedCalculation, setSelectedCalculation] = useState('count');
  const [calculationOptions, setCalculationOptions] = useState(['count', 'sum', 'avg', 'min', 'max']);
  const [currentValue, setCurrentValue] = useState();

  useEffect(() => {
    if (selectedEventName) {
      API.get(`/api/v1/events/${selectedEventName}/timeseries`).then(timeseries => {
        setLineChartData(timeseries);
        setCurrentValue(timeseries[timeseries.length - 1].value);
      });
      API.get(`/api/v1/events/${selectedEventName}/unique_properties`).then(setPropertyOptions);
    } else {
      setLineChartData();
      setCurrentValue();
      setPropertyOptions();
      setSelectedCalculation('count');
    }
  }, [selectedEventName])

  return (
    <>
      <h1 className='text-lg font-medium text-gray-700 mb-4'>Configure LineChart</h1>
      <div className='grid grid-cols-2 gap-4 flex items-center'>
        <div>
          <input className='input' placeholder='Line Chart Title' value={lineChartTitle} onChange={e => setLineChartTitle(e.target.value)} />
        </div>
      </div>
      <div className='flex text-sm text-gray-700 items-center mt-2'>
        <span className='mx-1'>Visualize the</span>
        <Dropdown options={calculationOptions || []} onSelect={setSelectedCalculation} label='Select the calculation for the property' />
        <span className='mx-1'>of</span>
        <Dropdown options={eventOptions} onSelect={setSelectedEventName} label='Select an event to visualize' />
        <span className='mx-1'>by</span>
        <Dropdown options={propertyOptions || []} onSelect={setPropertyToVisualize} label="Select the event's property" />
      </div>
      <div className='mt-4'>
        <LineChartWithValue title={lineChartTitle} timeseries={lineChartData} value={currentValue} />
      </div>
      <div className='flex justify-end mt-4'>
        <button
          className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
          onClick={() => onSaveClick({ title: lineChartTitle, event: selectedEventName })}
        >
          Save
        </button>
      </div>
    </>
  )
}