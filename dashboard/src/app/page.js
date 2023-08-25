'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
// import ItemizedList from '@/components/DashboardComponents/ItemizedList';
import ItemizedUsersList from '@/components/DashboardComponents/Prebuilt/ItemizedUsersList';
import ItemizedOrganizationsList from '@/components/DashboardComponents/Prebuilt/ItemizedOrganizationList';
import ActiveUsersLineChart from '@/components/DashboardComponents/Prebuilt/ActiveUsersLineChart';

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 mt-8 flex items-center'>
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
      </div>

      <div className="w-full flex items-center justify-end">
      </div>
    </div>
    <div className='grid grid-cols-2 gap-6 pt-8'>
      <ActiveUsersLineChart loadingStateOnly={true} />
      <LineChartWithValue title='Sessions' />
    </div>
    <div className='grid grid-cols-2 gap-6 pt-8'>
      <LineChartWithValue title='MRR' />
      <LineChartWithValue title='Active Subscriptions' />
    </div>
    <div className='grid grid-cols-2 gap-6 pt-8'>
      <ItemizedUsersList loadingStateOnly={true} /> 
      <ItemizedOrganizationsList loadingStateOnly={true} />
    </div>
  </main>
)

const Home = () => {
  const [mrrChart, setMrrChart] = useState();
  const [activeSubsChart, setActiveSubsChart] = useState();
  const [sessionsChart, setSessionsChart] = useState();

  const getBillingData = async () => {
    API.get('/api/v1/billing_data_snapshots', { timeframe: '30_days' }).then(paymentData => {
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

  const getSessionsData = async () => {
    API.get('/api/v1/sessions/timeseries', { timeframe: '30_days' }).then((sessionData) => {
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

  useEffect(() => {
    getSessionsData();
    getBillingData();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <ActiveUsersLineChart />
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
          previousValue={mrrChart?.previousValue}
          previousValueDate={mrrChart?.previousValueDate}
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

export default AuthenticatedView(Home, LoadingState);