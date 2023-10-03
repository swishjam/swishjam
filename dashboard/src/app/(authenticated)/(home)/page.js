'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import ClickableValueCard from '@/components/DashboardComponents/ClickableValueCard';
import ItemizedUsersList from '@/components/DashboardComponents/Prebuilt/ItemizedUsersList';
import ItemizedOrganizationsList from '@/components/DashboardComponents/Prebuilt/ItemizedOrganizationList';
import ActiveUsersLineChart from '@/components/DashboardComponents/Prebuilt/ActiveUsersLineChart';
import { Separator } from "@/components/ui/separator"
import Timefilter from '@/components/Timefilter';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import InstallBanner from '@/components/InstallBanner';

const currentChart = (selected, mrrChart, sessionsChart, activeSubsChart) => {
  if (selected === 'MRR') {
    return mrrChart;
  } else if (selected === 'Sessions') {
    return sessionsChart;
  } else if (selected === 'Active Subscriptions') {
    return activeSubsChart;
  }
}

export default function Home() {
  const [mrrChart, setMrrChart] = useState();
  const [activeSubsChart, setActiveSubsChart] = useState();
  const [sessionsChart, setSessionsChart] = useState();
  const [currentSelectedChart, setCurrentSelectedChart] = useState('MRR');
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');
  const [isRefreshing, setIsRefreshing] = useState();

  const getBillingData = async timeframe => {
    await API.get('/api/v1/billing_data_snapshots', { timeframe }).then(paymentData => {
      setMrrChart({
        value: paymentData.current_mrr,
        previousValue: paymentData.comparison_mrr,
        previousValueDate: paymentData.comparison_end_time,
        valueChange: paymentData.change_in_mrr,
        timeseries: paymentData.current_mrr_timeseries.map((timeseries, index) => ({
          ...timeseries,
          index,
          comparisonDate: paymentData.comparison_mrr_timeseries[index]?.date,
          comparisonValue: paymentData.comparison_mrr_timeseries[index]?.value
        })),
      })

      setActiveSubsChart({
        value: paymentData.current_num_active_subscriptions,
        previousValue: paymentData.comparison_num_active_subscriptions,
        previousValueDate: paymentData.comparison_end_time,
        valueChange: paymentData.change_in_num_active_subscriptions,
        timeseries: paymentData.current_num_active_subscriptions_timeseries.map((timeseries, index) => ({
          ...timeseries,
          index,
          comparisonDate: paymentData.comparison_num_active_subscriptions_timeseries[index]?.date,
          comparisonValue: paymentData.comparison_num_active_subscriptions_timeseries[index]?.value
        }))
      })
    });
  }

  const getSessionsData = async timeframe => {
    await API.get('/api/v1/sessions/timeseries', { data_source: 'product', timeframe }).then((sessionData) => {
      setSessionsChart({
        value: sessionData.current_count,
        previousValue: sessionData.comparison_count,
        previousValueDate: sessionData.comparison_end_time,
        valueChange: sessionData.count - sessionData.comparison_count,
        timeseries: sessionData.timeseries.map((timeseries, index) => ({
          ...timeseries,
          index,
          comparisonDate: sessionData.comparison_timeseries[index]?.date,
          comparisonValue: sessionData.comparison_timeseries[index]?.value
        }))
      })
    })
  }

  const getAllData = async timeframe => {
    setSessionsChart();
    setMrrChart();
    setActiveSubsChart();
    setIsRefreshing(true);
    await Promise.all([
      getSessionsData(timeframe),
      getBillingData(timeframe)
    ])
    setIsRefreshing(false);
  }

  useEffect(() => {
    getAllData(timeframeFilter);
  }, []);

  const selectedChart = currentChart(currentSelectedChart, mrrChart, sessionsChart, activeSubsChart)
  
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <InstallBanner hidden={isRefreshing || parseInt(sessionsChart?.value) > 0 || parseFloat(mrrChart?.value) > 0 || parseInt(activeSubsChart?.value) > 0} /> 
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Timefilter selection={timeframeFilter} onSelection={timeframe => { setTimeframeFilter(timeframe); getAllData(timeframe) }} />
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
        <ClickableValueCard
          title='MRR'
          value={mrrChart?.value}
          selected={currentSelectedChart == 'MRR'}
          previousValue={mrrChart?.previousValue}
          previousValueDate={mrrChart?.previousValueDate}
          valueFormatter={mrr => (mrr/100).toLocaleString('en-US', { style: "currency", currency: "USD" })}
          onClick={() => setCurrentSelectedChart('MRR')}
        /> 
        <ClickableValueCard
          title='Active Subscriptions'
          value={activeSubsChart?.value}
          selected={currentSelectedChart == 'Active Subscriptions'}
          previousValue={activeSubsChart?.previousValue}
          previousValueDate={sessionsChart?.previousValueDate}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
          onClick={() => setCurrentSelectedChart('Active Subscriptions')} 
        /> 
        <ClickableValueCard
          title='Sessions'
          value={sessionsChart?.value}
          selected={currentSelectedChart == 'Sessions'}
          previousValue={sessionsChart?.previousValue}
          previousValueDate={sessionsChart?.previousValueDate}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
          onClick={() => setCurrentSelectedChart('Sessions')}
        /> 
      </div>
      <div className='grid grid-cols-1 gap-6 pt-8'>
        <LineChartWithValue
          title={currentSelectedChart}
          value={selectedChart?.value}
          previousValue={selectedChart?.previousValue}
          previousValueDate={selectedChart?.previousValueDate}
          timeseries={selectedChart?.timeseries}
          valueFormatter={numSubs => currentSelectedChart === 'MRR' ? (numSubs/100).toLocaleString('en-US', { style: "currency", currency: "USD" }) : numSubs.toLocaleString('en-US')}
          showAxis={true}  
        />
        <Separator className="my-6"/>

      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ActiveUsersLineChart timeframe={timeframeFilter} />
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
        <LineChartWithValue
          title='MRR'
          value={mrrChart?.value}
          previousValue={mrrChart?.previousValue}
          previousValueDate={mrrChart?.previousValueDate}
          timeseries={mrrChart?.timeseries}
          valueFormatter={mrr => (mrr/100).toLocaleString('en-US', { style: "currency", currency: "USD" })}
        />
        <LineChartWithValue
          title='Active Subscriptions'
          value={activeSubsChart?.value}
          previousValue={activeSubsChart?.previousValue}
          previousValueDate={activeSubsChart?.previousValueDate}
          timeseries={activeSubsChart?.timeseries}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
        />
      </div> 
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ItemizedUsersList />
        <ItemizedOrganizationsList />
      </div>
    </main>
  );
}