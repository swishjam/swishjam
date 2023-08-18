'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
// import ItemizedList from '@/components/DashboardComponents/ItemizedList';
import BarListCard from '@/components/DashboardComponents/BarListCard';
import { BoltSlashIcon } from "@heroicons/react/24/outline";

function FormattedLineChartData(name) {
  return {
    title: name, 
    value: null,
    valueChange: null,
    timeseries: []
  }
}

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 mt-8 flex items-center'>
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Marketing Site Metrics</h1>
      </div>

      <div className="w-full flex items-center justify-end">
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6 pt-8'>
      <LineChartWithValue
        key='subs'
        title='User Sessions'
        value={null}
        valueChange={null}
        timeseries={null}
      />
    </div>
    <div className='grid grid-cols-2 gap-6 pt-8'>
    </div>
  </main>
)

const Home = () => {
  const [sessionsChart, setSessionsChart] = useState(FormattedLineChartData('User Sessions'));
  const items = [
    {
      name: '/home',
      href: '/',
      value: 345,
      icon: '',
    },
    {
      name: '/poop',
      href: '',
      value: 3654,
      icon: BoltSlashIcon,
    },
    {
      name: '/poop1',
      href: '',
      value: 654,
      icon: '',
    },
    {
      name: '/poop-the-remix',
      href: '',
      value: 54,
      icon: '',
    }
  ];


  const getData = async () => {
    
    API.get('/api/v1/sessions/timeseries').then((sessionData) => {
      console.log('Session Data', sessionData)
      setSessionsChart({
        ...sessionsChart,
        value: sessionData.count,
        previousValue: sessionData.comparison_count,
        previousValueDate: sessionData.comparison_end_time,
        valueChange: sessionData.count - sessionData.comparison_count,
        timeseries: sessionData.timeseries 
      })
    })
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Marketing Site Metrics</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <div className='col-span-2'>
          <LineChartWithValue
            key={sessionsChart.title}
            title={sessionsChart.title}
            value={sessionsChart.value}
            previousValue={sessionsChart.previousValue}
            previousValueDate={sessionsChart.previousValueDate}
            timeseries={sessionsChart.timeseries}
            formatter={numSubs => numSubs.toLocaleString('en-US')}
          />
        </div>
        <LineChartWithValue
          key={sessionsChart.title}
          title={sessionsChart.title}
          value={sessionsChart.value}
          previousValue={sessionsChart.previousValue}
          previousValueDate={sessionsChart.previousValueDate}
          timeseries={sessionsChart.timeseries}
          formatter={numSubs => numSubs.toLocaleString('en-US')}
        />
      </div> 
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarListCard
          title={'Referrers'}
          items={items} 
        /> 
        <BarListCard
          title={'Top Pages'}
          items={items} 
        /> 
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <BarListCard
          title={'Devices'}
          items={items} 
        /> 
        <BarListCard
          title={'Browsers'}
          items={items} 
        />
        <BarListCard
          title={'Countries'}
          items={items} 
        /> 

      </div>
    </main>
  );
}

export default AuthenticatedView(Home, LoadingState);