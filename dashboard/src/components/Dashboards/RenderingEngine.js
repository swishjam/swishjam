
import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import GridLayout from 'react-grid-layout';
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import BarChart from "@/components/Dashboards/Components/BarChart";
import PieChart from "@/components/Dashboards/Components/PieChart";
import ValueCard from '@/components/Dashboards/Components/ValueCard';
import BarList from '@/components/Dashboards/Components/BarList';
import { Card } from '@/components/ui/card';

const LineChartDashboardComponent = ({ title, event, property, calculation, timeframe }) => {
  const [timeseries, setTimeseries] = useState();
  const [currentValue, setCurrentValue] = useState();

  useEffect(() => {
    setTimeseries();
    setCurrentValue();
    // TODO: Endpoint doesn't do anything with property or calculation yet.
    API.get(`/api/v1/events/${event}/timeseries`, { property, calculation, timeframe }).then(data => {
      setTimeseries(data);
      setCurrentValue(data[data.length - 1].value);
    });
  }, [event, property, calculation, timeframe]);

  return (
    <LineChartWithValue title={title} timeseries={timeseries} value={currentValue} includeCard={false} />
  )
}

const PieChartDashboardComponent = ({ title, event, property, timeframe }) => {
  const [pieChartData, setPieChartData] = useState();

  useEffect(() => {
    setPieChartData();
    API.get(`/api/v1/events/${event}/properties/${property}/counts`, { timeframe }).then(data => {
      setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event, property, timeframe]);

  return (
    <PieChart title={title} data={pieChartData} includeCard={false} />
  )
}

const BarListDashboardComponent = ({ title, event, property, timeframe }) => {
  const [barListData, setBarListData] = useState();

  useEffect(() => {
    setBarListData();
    API.get(`/api/v1/events/${event}/properties/${property}/counts`, { timeframe }).then(data => {
      setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event, property, timeframe]);

  return (
    <BarList title={title} items={barListData} includeCard={false} />
  )
}

const ValueCardDashboardComponent = ({ title, event, property, calculation, timeframe }) => {
  const [value, setValue] = useState();
  const [previousValue, setPreviousValue] = useState();
  const [previousValueDate, setPreviousValueDate] = useState();

  useEffect(() => {
    setValue();
    setPreviousValue();
    setPreviousValueDate();
    if (calculation === 'count') {
      API.get(`/api/v1/events/${event}/count`, { timeframe }).then(({ count, comparison_count, comparison_start_time }) => {
        setValue(count);
        setPreviousValue(comparison_count);
        setPreviousValueDate(comparison_start_time);
      });
    } else {
      // TODO: Support the other calculation types
    }
  }, [event, property, calculation, timeframe]);

  return (
    <ValueCard title={title} value={value} previousValue={previousValue} previousValueDate={previousValueDate} includeCard={false} />
  )
}


export default function RenderingEngine({ components, timeframe, onLayoutChange = () => {} }) {
  debugger;
  return (
    <GridLayout
      layout={components}
      cols={8}
      rowHeight={40}
      width={1200}
      onLayoutChange={onLayoutChange}
    >
      {components.map(({ i, configuration }) => {
        switch(configuration.type) {
          case 'LineChart':
            return (
              <Card key={i} className='p-4 overflow-hidden'>
                <LineChartDashboardComponent title={configuration.title} event={configuration.event} property={configuration.property} calculation={configuration.calculation} timeframe={timeframe} />
              </Card>
            )
          case 'BarChart':
            return (
              <Card key={i} className='p-4 overflow-hidden'>
                <BarChart title={configuration.title} event={configuration.event} property={configuration.property} calculation={configuration.calculation} timeframe={timeframe} />
              </Card>
            )
          case 'PieChart':
            return (
              <Card key={i} className='p-4 overflow-hidden'>
                <PieChartDashboardComponent title={configuration.title} event={configuration.event} property={configuration.property} timeframe={timeframe} />
              </Card>
            )
          case 'ValueCard':
            return (
              <Card key={i} className='p-4 overflow-hidden'>
                <ValueCardDashboardComponent title={configuration.title} event={configuration.event} property={configuration.property} calculation={configuration.calculation} timeframe={timeframe} />
              </Card>
            )
          case 'BarList':
            return (
              <Card key={i} className='p-4 overflow-hidden'>
                <BarListDashboardComponent title={configuration.title} event={configuration.event} property={configuration.property} timeframe={timeframe} />
              </Card>
            )
        }
      })}
    </GridLayout>
  )
}