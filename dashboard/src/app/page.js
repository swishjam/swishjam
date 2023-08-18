'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
// import ItemizedList from '@/components/DashboardComponents/ItemizedList';
import ItemizedUsersList from '@/components/DashboardComponents/Prebuilt/ItemizedUsersList';
import ItemizedOrganizationsList from '@/components/DashboardComponents/Prebuilt/ItemizedOrganizationList';

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
        <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
      </div>

      <div className="w-full flex items-center justify-end">
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6 pt-8'>
      <LineChartWithValue
        key='MRR'
        title='MRR'
        value={null}
        valueChange={null}
        timeseries={null}
      />
      <LineChartWithValue
        key='subs'
        title='Active Subscriptions'
        value={null}
        valueChange={null}
        timeseries={null}
      />
      <LineChartWithValue
        key='sessions'
        title='User Sessions'
        value={null}
        valueChange={null}
        timeseries={null}
      />
    </div>
    <div className='grid grid-cols-2 gap-6 pt-8'>
      <ItemizedUsersList loadingStateOnly={true} /> 
      <ItemizedOrganizationsList loadingStateOnly={true} />
    </div>
  </main>
)

const Home = () => {
  const [mrrChart, setMrrChart] = useState(FormattedLineChartData('MRR'));
  const [activeSubsChart, setActiveSubsChart] = useState(FormattedLineChartData('Active Subscriptions'));
  const [sessionsChart, setSessionsChart] = useState(FormattedLineChartData('User Sessions'));

  const getData = async () => {
    API.get('/api/v1/billing_data_snapshots').then(paymentData => {
      console.log('paymentData', paymentData) 
      setMrrChart({
        ...mrrChart,
        value: paymentData.current_mrr,
        previousValue: paymentData.comparison_mrr,
        previousValueDate: paymentData.comparison_end_time,
        valueChange: paymentData.change_in_mrr,
        timeseries: paymentData.current_mrr_timeseries.map((timeseries, index) => ({ ...timeseries, index, comparisonDate: paymentData.comparison_mrr_timeseries[index].date, comparisonValue: paymentData.comparison_mrr_timeseries[index].value})),
      })

      setActiveSubsChart({
        ...activeSubsChart,
        value: paymentData.current_num_active_subscriptions,
        previousValue: paymentData.comparison_num_active_subscriptions,
        previousValueDate: paymentData.comparison_end_time,
        valueChange: paymentData.change_in_num_active_subscriptions,
        timeseries: paymentData.current_num_active_subscriptions_timeseries
      })
    });
    
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
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <div className='grid grid-cols-3 gap-6 pt-8'>
        <LineChartWithValue
          key={mrrChart.title}
          title={mrrChart.title}
          value={mrrChart.value}
          previousValue={mrrChart.previousValue}
          previousValueDate={mrrChart.previousValueDate}
          timeseries={mrrChart.timeseries}
          formatter={mrr => (mrr/100).toLocaleString('en-US', { style: "currency", currency: "USD" })}
        />
        <LineChartWithValue
          key={activeSubsChart.title}
          title={activeSubsChart.title}
          value={activeSubsChart.value}
          previousValue={mrrChart.previousValue}
          previousValueDate={mrrChart.previousValueDate}
          timeseries={activeSubsChart.timeseries}
          formatter={numSubs => numSubs.toLocaleString('en-US')}
        />
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
        <ItemizedUsersList />
        <ItemizedOrganizationsList />
      </div>
    </main>
  );
}

export default AuthenticatedView(Home, LoadingState);