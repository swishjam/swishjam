
import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from "@/components/DashboardComponents/LineChartWithValue";
import BarChart from "@/components/DashboardComponents/BarChart";
import PieChart from "@/components/DashboardComponents/PieChart";
import ValueCard from '@/components/DashboardComponents/ValueCard';
import BarListCard from '@/components/DashboardComponents/BarListCard';

const LineChartDashboardComponent = ({ title, event, property, calculation }) => {
  const [timeseries, setTimeseries] = useState();
  const [currentValue, setCurrentValue] = useState();

  useEffect(() => {
    // TODO: Endpoint doesn't do anything with property or calculation yet.
    API.get(`/api/v1/events/${event}/timeseries?property=${property}&calculation=${calculation}`).then(data => {
      setTimeseries(data);
      setCurrentValue(data[data.length - 1].value);
    });
  }, [event]);

  return (
    <LineChartWithValue title={title} timeseries={timeseries} value={currentValue} />
  )
}

const PieChartDashboardComponent = ({ title, event, property }) => {
  const [pieChartData, setPieChartData] = useState();

  useEffect(() => {
    API.get(`/api/v1/events/${event}/properties/${property}/counts`).then(data => {
      setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event]);

  return (
    <PieChart title={title} data={pieChartData} />
  )
}

const BarListDashboardComponent = ({ title, event, property }) => {
  const [barListData, setBarListData] = useState();

  useEffect(() => {
    API.get(`/api/v1/events/${event}/properties/${property}/counts`).then(data => {
      setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
    });
  }, [event]);

  return (
    <BarListCard title={title} items={barListData} />
  )
}


export default function RenderingEngine({ components }) {
  console.log('Attempting to render: ', components);
  return (
    components.map(component => {
      switch(component.type) {
        case 'LineChart':
          return <LineChartDashboardComponent title={component.title} event={component.event} property={component.property} calculation={component.calculation} />
        case 'BarChart':
          return <BarChart title={component.title} event={component.event} property={component.property} calculation={component.calculation} />
        case 'PieChart':
          return <PieChartDashboardComponent title={component.title} event={component.event} property={component.property} />
        case 'ValueCard':
          return <ValueCard title={component.title} event={component.event} property={component.property} calculation={component.calculation} />
        case 'BarList':
          return <BarListDashboardComponent title={component.title} event={component.event} property={component.property} />
      }
    })
  )
}