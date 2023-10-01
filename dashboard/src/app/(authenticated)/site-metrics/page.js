'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import BarChart from '@/components/DashboardComponents/BarChart';
import BarListCard from '@/components/DashboardComponents/BarListCard';
import Timefilter from '@/components/Timefilter';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
// import LoadingView from './LoadingView'

export default function PageMetrics() {
  const [sessionsLineChart, setSessionsLineChart] = useState();
  const [referrersBarChartData, setReferrersBarChartData] = useState();
  const [pageViewsBarChartData, setPageViewsBarChartData] = useState();

  const [topReferrers, setTopReferrers] = useState();
  const [topPages, setTopPages] = useState();
  const [topDevices, setTopDevices] = useState();
  const [topBrowsers, setTopBrowsers] = useState();
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

  // const getTopPages = async timeframe => {
  //   await API.get('/api/v1/page_views', { timeframe }).then(({ page_view_counts }) => {
  //     setTopPages(page_view_counts.map(({ url, count }) => ({ name: url, value: count })));
  //   });
  // }

  const getPageViewsBarChartData = async timeframe => {
    await API.get('/api/v1/page_views/bar_chart', { timeframe }).then(({ data }) => {
      setPageViewsBarChartData(data);
    })
  }

  const getReferrersBarChartData = async timeframe => {
    await API.get('/api/v1/sessions/referrers/bar_chart', { timeframe }).then(({ data }) => {
      setReferrersBarChartData(data)
    })
  }

  const getAllData = async timeframe => {
    setIsRefreshing(true);
    setSessionsLineChart();
    setReferrersBarChartData();
    setPageViewsBarChartData();
    // setTopPages();
    // setTopReferrers();
    setTopDevices();
    setTopBrowsers();
    await Promise.all([
      getSessionsTimeseriesData(timeframe),
      // getTopPages(timeframe),
      getPageViewsBarChartData(timeframe),
      getReferrersBarChartData(timeframe),
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
        {/* <BarListCard title='Referrers' items={topReferrers} /> */}
        <BarChart title='Referrers' data={referrersBarChartData} />
        {/* <BarListCard title='Top Pages' items={topPages} /> */}
        <BarChart title='Page Views' data={pageViewsBarChartData} />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarListCard title='Devices' items={topDevices} />
        <BarListCard title='Browsers' items={topBrowsers} />
        {/* <BarListCard title='Countries' items={topCountries} />  */}
      </div>
    </main>
  );
}