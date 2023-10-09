'use client';

import { useState, useEffect } from 'react';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import ClickableValueCard from '@/components/DashboardComponents/ClickableValueCard';
import ActiveUsersLineChartWithValue from '@/components/DashboardComponents/ActiveUsersLineChartWithValue'
import Timefilter from '@/components/Timefilter';
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import InstallBanner from '@/components/InstallBanner';
import ItemizedList from '@/components/DashboardComponents/ItemizedList';
import RetentionWidget from '@/components/DashboardComponents/RetentionWidget';

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
  const [activeSubsChart, setActiveSubsChart] = useState();
  const [currentSelectedChart, setCurrentSelectedChart] = useState('Sessions');
  const [isRefreshing, setIsRefreshing] = useState();
  const [mrrChart, setMrrChart] = useState();
  const [newOrganizationsData, setNewOrganizationsData] = useState();
  const [newUsersData, setNewUsersData] = useState();
  const [sessionsChart, setSessionsChart] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');
  const [uniqueVisitorsChartData, setUniqueVisitorsChartData] = useState();
  const [uniqueVisitorsGrouping, setUniqueVisitorsGrouping] = useState('weekly');
  const [userRetentionData, setUserRetentionData] = useState();

  const getBillingData = async timeframe => {
    return await SwishjamAPI.BillingData.timeseries({ timeframe }).then(paymentData => {
      setMrrChart({
        value: paymentData.current_mrr,
        previousValue: paymentData.comparison_mrr,
        previousValueDate: paymentData.comparison_end_time,
        valueChange: paymentData.change_in_mrr,
        groupedBy: paymentData.grouped_by,
        timeseries: paymentData.current_mrr_timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: paymentData.comparison_mrr_timeseries[index]?.date,
          comparisonValue: paymentData.comparison_mrr_timeseries[index]?.value
        })),
      })

      setActiveSubsChart({
        value: paymentData.current_num_active_subscriptions,
        previousValue: paymentData.comparison_num_active_subscriptions,
        previousValueDate: paymentData.comparison_end_time,
        valueChange: paymentData.change_in_num_active_subscriptions,
        groupedBy: paymentData.grouped_by,
        timeseries: paymentData.current_num_active_subscriptions_timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: paymentData.comparison_num_active_subscriptions_timeseries[index]?.date,
          comparisonValue: paymentData.comparison_num_active_subscriptions_timeseries[index]?.value
        }))
      })
    });
  }

  const getSessionsData = async timeframe => {
    return await SwishjamAPI.Sessions.timeseries({ dataSource: 'product', timeframe }).then((sessionData) => {
      setSessionsChart({
        value: sessionData.current_count,
        previousValue: sessionData.comparison_count,
        previousValueDate: sessionData.comparison_end_time,
        valueChange: sessionData.count - sessionData.comparison_count,
        groupedBy: sessionData.grouped_by,
        timeseries: sessionData.timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: sessionData.comparison_timeseries[index]?.date,
          comparisonValue: sessionData.comparison_timeseries[index]?.value
        }))
      })
    })
  }

  const getUniqueVisitorsData = async (timeframe, type) => {
    return await SwishjamAPI.Users.Active.timeseries({ timeframe, dataSource: 'product', type, include_comparison: true }).then(
      ({ current_value, timeseries, comparison_value, comparison_timeseries, comparison_end_time, grouped_by }) => {
        setUniqueVisitorsChartData({
          value: current_value || 0,
          previousValue: comparison_value || 0,
          previousValueDate: comparison_end_time,
          valueChange: (current_value || 0) - (comparison_value || 0),
          groupedBy: grouped_by,
          timeseries: timeseries?.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
        });
      }
    );
  };

  const getUserRetentionData = async () => {
    return await SwishjamAPI.RetentionCohorts.get().then(setUserRetentionData)
  }

  const getUsersData = async () => {
    return await SwishjamAPI.Users.list().then(({ users }) => setNewUsersData(users))
  }

  const getOrganizationsData = async () => {
    return await SwishjamAPI.Organizations.list().then(({ organizations }) => setNewOrganizationsData(organizations));
  }

  const getAllData = async timeframe => {
    setSessionsChart();
    setMrrChart();
    setActiveSubsChart();
    setUniqueVisitorsChartData();
    setNewUsersData();
    setNewOrganizationsData();
    setUserRetentionData();
    setIsRefreshing(true);
    await Promise.all([
      getSessionsData(timeframe),
      getBillingData(timeframe),
      getUniqueVisitorsData(timeframe, uniqueVisitorsGrouping),
      getUsersData(),
      getOrganizationsData(),
      getUserRetentionData(),
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
          title='Sessions'
          value={sessionsChart?.value}
          selected={currentSelectedChart == 'Sessions'}
          previousValue={sessionsChart?.previousValue}
          previousValueDate={sessionsChart?.previousValueDate}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
          onClick={() => setCurrentSelectedChart('Sessions')}
        />
        <ClickableValueCard
          title='MRR'
          value={mrrChart?.value}
          selected={currentSelectedChart == 'MRR'}
          previousValue={mrrChart?.previousValue}
          previousValueDate={mrrChart?.previousValueDate}
          valueFormatter={mrr => (mrr / 100).toLocaleString('en-US', { style: "currency", currency: "USD" })}
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
      </div>
      <div className='grid grid-cols-1 gap-6 pt-8'>
        <LineChartWithValue
          title={currentSelectedChart}
          value={selectedChart?.value}
          previousValue={selectedChart?.previousValue}
          previousValueDate={selectedChart?.previousValueDate}
          timeseries={selectedChart?.timeseries}
          groupedBy={selectedChart?.groupedBy}
          valueFormatter={numSubs => currentSelectedChart === 'MRR' ? (numSubs / 100).toLocaleString('en-US', { style: "currency", currency: "USD" }) : numSubs.toLocaleString('en-US')}
          showAxis={true}
        />
        <Separator className="my-6" />

      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ActiveUsersLineChartWithValue
          data={uniqueVisitorsChartData}
          selectedGrouping={uniqueVisitorsGrouping}
          onGroupingChange={group => {
            setUniqueVisitorsChartData();
            setUniqueVisitorsGrouping(group);
            getUniqueVisitorsData(timeframeFilter, group);
          }}
        />
        <LineChartWithValue
          title='Sessions'
          value={sessionsChart?.value}
          previousValue={sessionsChart?.previousValue}
          previousValueDate={sessionsChart?.previousValueDate}
          timeseries={sessionsChart?.timeseries}
          valueFormatter={numSubs => numSubs.toLocaleString('en-US')}
        />
      </div>
      <div className='pt-8'>
        <RetentionWidget retentionCohorts={userRetentionData} />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ItemizedList
          fallbackAvatarGenerator={user => user.initials}
          items={newUsersData}
          leftItemHeaderKey='full_name'
          leftItemSubHeaderKey='email'
          linkFormatter={user => `/users/${user.id}`}
          rightItemKey='created_at'
          rightItemKeyFormatter={date => {
            return new Date(date)
              .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
              .replace(`, ${new Date(date).getFullYear()}`, '')
          }}
          title='New Users'
          viewMoreUrl='/users'
        />
        <ItemizedList
          fallbackAvatarGenerator={org => org.initials}
          items={newOrganizationsData}
          leftItemHeaderKey='name'
          linkFormatter={org => `/organizations/${org.id}`}
          noDataMsg='No organizations identified yet.'
          rightItemKey='created_at'
          rightItemKeyFormatter={date => {
            return new Date(date)
              .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
              .replace(`, ${new Date(date).getFullYear()}`, '')
          }}
          title='New Organizations'
          viewMoreUrl='/organizations'
        />
      </div>
    </main>
  );
}