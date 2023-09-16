
import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import BarChart from "@/components/Dashboards/Components/BarChart";
import PieChart from "@/components/Dashboards/Components/PieChart";
import ValueCard from '@/components/Dashboards/Components/ValueCard';
import BarListCard from '@/components/Dashboards/Components/BarListCard';

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
    <LineChartWithValue title={title} timeseries={timeseries} value={currentValue} />
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
    <PieChart title={title} data={pieChartData} />
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
    <BarListCard title={title} items={barListData} />
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
    <ValueCard title={title} value={value} previousValue={previousValue} previousValueDate={previousValueDate} />
  )
}


export default function RenderingEngine({ components, timeframe }) {
  return (
    components.map(({ type, title, event, property, calculation }) => {
      switch(type) {
        case 'LineChart':
          return <LineChartDashboardComponent title={title} event={event} property={property} calculation={calculation} timeframe={timeframe} />
        case 'BarChart':
          return <BarChart title={title} event={event} property={property} calculation={calculation} timeframe={timeframe} />
        case 'PieChart':
          return <PieChartDashboardComponent title={title} event={event} property={property} timeframe={timeframe} />
        case 'ValueCard':
          return <ValueCardDashboardComponent title={title} event={event} property={property} calculation={calculation} timeframe={timeframe} />
        case 'BarList':
          return <BarListDashboardComponent title={title} event={event} property={property} timeframe={timeframe} />
      }
    })
  )
}