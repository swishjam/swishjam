'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import AuthenticatedView from '@/components/AuthenticatedView';
import ChartCardWithNumberAndLine from '@/components/ChartCardWithNumberAndLine';

function DashboardComponent(name) {
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
      <ChartCardWithNumberAndLine
        key='MRR'
        title='MRR'
        value={null}
        valueChange={null}
        timeseries={null}
      />
      <ChartCardWithNumberAndLine
        key='subs'
        title='Active Subscriptions'
        value={null}
        valueChange={null}
        timeseries={null}
      />
    </div>
  </main>
)

const Home = () => {
  const [mrrChart, setMrrChart] = useState(DashboardComponent('MRR'))
  const [activeSubsChart, setActiveSubsChart] = useState(DashboardComponent('Active Subscriptions'))
  const [sessionsChart, setSessionsChart] = useState(DashboardComponent('User Sessions'))


  useEffect(() => {
    const getDashboard = async () => {
      API.get('/api/v1/billing_data_snapshots').then(paymentData =>{
        setMrrChart({
          ...mrrChart,
          value: (paymentData.current_mrr/100).toLocaleString('en-US', { style: "currency", currency: "USD" }),
          timeseries: paymentData.current_mrr_timeseries
        })
      
        setActiveSubsChart({
          ...activeSubsChart,
          value: paymentData.current_num_active_subscriptions,
          timeseries: paymentData.current_num_active_subscriptions_timeseries
        })
      });
    
      API.get('/api/v1/session/count').then((sessionCount) =>{
        
      })
      API.get('/api/v1/session/timeseries').then((sessionTimeseries) =>{
      
      })
    
    }
    getDashboard();
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
        {mrrChart && <ChartCardWithNumberAndLine
          key={mrrChart.title}
          title={mrrChart.title}
          value={mrrChart.value}
          valueChange={mrrChart.valueChange}
          timeseries={mrrChart.timeseries}
          formatter={(a) => (a/100).toLocaleString('en-US', { style: "currency", currency: "USD" })}
        />}
        {activeSubsChart && <ChartCardWithNumberAndLine
          key={activeSubsChart.title}
          title={activeSubsChart.title}
          value={activeSubsChart.value}
          valueChange={activeSubsChart.valueChange}
          timeseries={activeSubsChart.timeseries}
        />}
      </div> 
    </main>
  );
}

export default AuthenticatedView(Home, LoadingState);