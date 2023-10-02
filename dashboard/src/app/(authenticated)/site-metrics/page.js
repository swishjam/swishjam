'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import BarChart from '@/components/DashboardComponents/BarChart';
import Timefilter from '@/components/Timefilter';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
// import LoadingView from './LoadingView'

export default function PageMetrics() {
  const [sessionsLineChart, setSessionsLineChart] = useState();
  const [referrersBarChartData, setReferrersBarChartData] = useState();
  const [pageViewsBarChartData, setPageViewsBarChartData] = useState();
  const [browsersBarChartData, setBrowsersBarChartData] = useState();
  const [deviceTypesBarChartData, setDeviceTypesBarChartData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSessionsTimeseriesData = async timeframe => {
    await API.get('/api/v1/sessions/timeseries', { timeframe }).then(sessionData => {
      setSessionsLineChart({
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

  // const getReferrerData = async timeframe => {
  //   await API.get('/api/v1/sessions/referrers', { timeframe }).then(({ referrers }) => {
  //     setTopReferrers(referrers.map(({ referrer, count }) => ({
  //       name: [null, undefined, ''].includes(referrer) ? 'Direct' : referrer,
  //       value: count
  //     })));
  //   });
  // }

  const getBrowsersBarChartData = async timeframe => {
    await getBarChartData('/api/v1/sessions/browsers/bar_chart', timeframe, setBrowsersBarChartData)
  }

  const getPageViewsBarChartData = async timeframe => {
    await getBarChartData('/api/v1/page_views/bar_chart', timeframe, setPageViewsBarChartData)
  }

  const getReferrersBarChartData = async timeframe => {
    await getBarChartData('/api/v1/sessions/referrers/bar_chart', timeframe, setReferrersBarChartData)
  }

  const getDeviceTypesBarChartData = async timeframe => {
    await getBarChartData('/api/v1/sessions/device_types/bar_chart', timeframe, setDeviceTypesBarChartData)
  }

  const getBarChartData = async (endpoint, timeframe, setter) => {
    await API.get(endpoint, { timeframe }).then(({ data }) => setter(data))
  }

  const getAllData = async timeframe => {
    setIsRefreshing(true);
    setSessionsLineChart();
    setReferrersBarChartData();
    setPageViewsBarChartData();
    setBrowsersBarChartData();
    setDeviceTypesBarChartData();
    await Promise.all([
      getSessionsTimeseriesData(timeframe),
      getPageViewsBarChartData(timeframe),
      getReferrersBarChartData(timeframe),
      getBrowsersBarChartData(timeframe),
      getDeviceTypesBarChartData(timeframe),
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
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <div className='col-span-2'>
          <LineChartWithValue
            title='Sessions'
            value={sessionsLineChart?.value}
            previousValue={sessionsLineChart?.previousValue}
            previousValueDate={sessionsLineChart?.previousValueDate}
            timeseries={sessionsLineChart?.timeseries}
            valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
          />
        </div>
        <LineChartWithValue
          title='Sessions'
          value={sessionsLineChart?.value}
          previousValue={sessionsLineChart?.previousValue}
          previousValueDate={sessionsLineChart?.previousValueDate}
          timeseries={sessionsLineChart?.timeseries}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
        />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarChart title='Referrers' data={referrersBarChartData} />
        <BarChart title='Page Views' data={pageViewsBarChartData} />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarChart title='Devices' data={deviceTypesBarChartData} />
        <BarChart title='Browsers' data={browsersBarChartData} />
      </div>
    </main>
  );
}