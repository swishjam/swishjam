'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import BarListCard from '@/components/DashboardComponents/Prebuilt/BarListCard';
import Timefilter from '@/components/Timefilter';

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
        <Timefilter/>
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6 pt-8'>
      <div className='col-span-2'>
        <LineChartWithValue title='Sessions' />
      </div>
      <LineChartWithValue title='Visitors' />
    </div>
    <div className='grid grid-cols-2 gap-6 pt-8'>
      <BarListCard title='Referrers' />
      <BarListCard title='Top Pages' />
    </div>
    <div className='grid grid-cols-3 gap-6 pt-8'>
      <BarListCard title='Devices' />
      <BarListCard title='Browsers' />
      <BarListCard title='Countries' />
    </div>
  </main>
)

const Home = () => {
  const [sessionsChart, setSessionsChart] = useState();
  const [topReferrers, setTopReferrers] = useState();
  const [topPages, setTopPages] = useState();
  const [topDevices, setTopDevices] = useState();
  const [topBrowsers, setTopBrowsers] = useState();
  const [topCountries, setTopCountries] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');

  const getSessionData = async (tf) => {
    API.get('/api/v1/sessions/timeseries', { timeframe: tf }).then((sessionData) => {
      setSessionsChart({
        value: sessionData.current_count,
        previousValue: sessionData.comparison_count,
        previousValueDate: sessionData.comparison_end_time,
        valueChange: sessionData.current_count - sessionData.comparison_count,
        timeseries: sessionData.timeseries.map((timeseries, index) => ({
          ...timeseries,
          index,
          comparisonDate: sessionData.comparison_timeseries[index]?.date,
          comparisonValue: sessionData.comparison_timeseries[index]?.value
        })),
      })
    })
  }

  const getReferrerData = async (tf) => {
    API.get('/api/v1/sessions/referrers', { timeframe: tf }).then(({ referrers }) => {
      setTopReferrers(referrers.map(({ referrer, count }) => ({ name: referrer, value: count })));
    });
  }

  const getDemographicData = async (tf) => {
    API.get('/api/v1/sessions/demographics', { timeframe: tf }).then(demographics => {
      setTopBrowsers(demographics.browsers.map(({ browser, count }) => ({ name: browser, value: count }))),
      setTopDevices([{ name: 'Desktop', value: demographics.desktop_count }, { name: 'Mobile', value: demographics.mobile_count }])
      setTopCountries(topCountries)
    });
  }

  const getTopPages = async (tf) => {
    API.get('/api/v1/page_hits', { timeframe: tf }).then(({ top_pages }) => {
      setTopPages(top_pages.map(({ url, count }) => ({ name: url, value: count })));
    });
  }

  const getAllData = (t) => {
    getSessionData(t);
    getTopPages(t);
    getDemographicData(t);
    getReferrerData(t);
  }


  useEffect(() => {
    getAllData(timeframeFilter)
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Marketing Site Metrics</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Timefilter
            selection={timeframeFilter}
            onSelection={(d) => {setTimeframeFilter(d);getAllData(d)}} 
          />
        </div>
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <div className='col-span-2'>
          <LineChartWithValue
            title='Sessions'
            value={sessionsChart?.value}
            previousValue={sessionsChart?.previousValue}
            previousValueDate={sessionsChart?.previousValueDate}
            timeseries={sessionsChart?.timeseries}
            valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
          />
        </div>
        <LineChartWithValue
          title='Sessions'
          value={sessionsChart?.value}
          previousValue={sessionsChart?.previousValue}
          previousValueDate={sessionsChart?.previousValueDate}
          timeseries={sessionsChart?.timeseries}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
        />
      </div> 
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarListCard title='Referrers' items={topReferrers} /> 
        <BarListCard title='Top Pages' items={topPages} /> 
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <BarListCard title='Devices' items={topDevices} /> 
        <BarListCard title='Browsers' items={topBrowsers} />
        <BarListCard title='Countries' items={topCountries} /> 
      </div>
    </main>
  );
}

export default AuthenticatedView(Home, LoadingState);