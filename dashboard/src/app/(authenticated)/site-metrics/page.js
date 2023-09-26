'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import ClickableValueCard from '@/components/DashboardComponents/ClickableValueCard';
import BarListCard from '@/components/DashboardComponents/BarListCard';
import Timefilter from '@/components/Timefilter';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
// import LoadingView from './LoadingView'

export default function PageMetrics() {
  const [sessionsChart, setSessionsChart] = useState();
  const [topReferrers, setTopReferrers] = useState();
  const [topPages, setTopPages] = useState();
  const [topDevices, setTopDevices] = useState();
  const [topBrowsers, setTopBrowsers] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSelectedChart, setCurrentSelectedChart] = useState('sessions');

  const getSessionData = async timeframe => {
    await API.get('/api/v1/sessions/timeseries', { timeframe }).then(sessionData => {
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
        }))
      })
    })
  }

  const getReferrerData = async timeframe => {
    await API.get('/api/v1/sessions/referrers', { timeframe }).then(({ referrers }) => {
      setTopReferrers(referrers.map(({ referrer, count }) => ({
        name: [null, undefined, ''].includes(referrer) ? 'Direct' : referrer,
        value: count
      })));
    });
  }

  const getDemographicData = async timeframe => {
    await API.get('/api/v1/sessions/demographics', { timeframe }).then(demographics => {
      setTopBrowsers(demographics.browsers.map(({ browser_name, count }) => ({ name: browser_name, value: count })));
      setTopDevices(demographics.device_types.map(({ device_type, count }) => ({ name: device_type, value: count })));
      // setTopCountries(Object.keys(demographics.countries).map(country => ({ name: country, value: demographics.countries[country] })));
    });
  }

  const getTopPages = async timeframe => {
    await API.get('/api/v1/page_views', { timeframe }).then(({ page_view_counts }) => {
      setTopPages(page_view_counts.map(({ url, count }) => ({ name: url, value: count })));
    });
  }

  const getAllData = async timeframe => {
    setIsRefreshing(true);
    setSessionsChart();
    setTopReferrers();
    setTopPages();
    setTopDevices();
    setTopBrowsers();
    await Promise.all([
      getSessionData(timeframe),
      getTopPages(timeframe),
      getDemographicData(timeframe),
      getReferrerData(timeframe),
    ]);
    setIsRefreshing(false);
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
            onSelection={d => {
              setTimeframeFilter(d);
              getAllData(d)
            }} 
            />
          <Button
            variant='outline'
            className={`ml-4 bg-white ${isRefreshing ? 'cursor-not-allowed' : ''}`}
            onClick={() => getAllData(timeframeFilter)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-4 gap-6 pt-8'>
          <div className='grid gap-6'>
            <ClickableValueCard
              title='Sessions'
              selected={currentSelectedChart == 'sessions'}
              value={sessionsChart?.value}
              previousValue={sessionsChart?.previousValue}
              previousValueDate={sessionsChart?.previousValueDate}
              timeseries={sessionsChart?.timeseries}
              valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
              onClick={() => setCurrentSelectedChart('MRR')}
            /> 
            <ClickableValueCard
              title='Unique Vistors'
              value={sessionsChart?.value}
              previousValue={sessionsChart?.previousValue}
              previousValueDate={sessionsChart?.previousValueDate}
              timeseries={sessionsChart?.timeseries}
              valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
              onClick={() => setCurrentSelectedChart('MRR')}
            /> 
            <ClickableValueCard
              title='Page Views'
              value={sessionsChart?.value}
              previousValue={sessionsChart?.previousValue}
              previousValueDate={sessionsChart?.previousValueDate}
              timeseries={sessionsChart?.timeseries}
              valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
              onClick={() => setCurrentSelectedChart('MRR')}
            /> 
          </div>
          <div className='col-span-3'>
            <LineChartWithValue
              title='Sessions'
              value={sessionsChart?.value}
              previousValue={sessionsChart?.previousValue}
              previousValueDate={sessionsChart?.previousValueDate}
              timeseries={sessionsChart?.timeseries}
              valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
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
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarListCard title='Devices' items={topDevices} />
        <BarListCard title='Browsers' items={topBrowsers} />
        {/* <BarListCard title='Countries' items={topCountries} />  */}
      </div>
    </main>
  );
}