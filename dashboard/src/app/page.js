'use client';
import { useState, useEffect, Fragment } from 'react';
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

export default function Home() {
  // const { dashboardComponents, setDashboardComponents} = useState([]);
  const [mrrChart, setMrrChart] = useState(DashboardComponent('MRR'))
  const [activeSubsChart, setActiveSubsChart] = useState(DashboardComponent('Active Subscriptions'))
  useEffect(() => {
    const getDashboard = async () => {
      const paymentData = API.get('/api/v1/billing_data_snapshots').then((paymentData) =>{
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
    }
    getDashboard();
  }, []);

  console.log(mrrChart)

  return (
    <AuthenticatedView>
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
           
          {/*dashboardComponents && dashboardComponents.map((dc) => (
            <ChartCardWithNumberAndLine
              key={dc.title}
              title={dc.title}
              value={dc.value}
              valueChange={dc.valueChange}
              timeseries={dc.timeseries}
            />
          ))*/}
        </div> 
          <div
            className="mt-6" 
          >
{/*
        <ChartCardWithNumberAndLine
          key={dashboardComponents[0].title}
          title={dashboardComponents[0].title}
          value={dashboardComponents[0].value}
          valueChange={dashboardComponents[0].valueChange}
          timeseries={dashboardComponents[0].timeseries}
        /> */}

          </div>
      </main>
    </AuthenticatedView>
  );
}

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "May",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Jul",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Aug",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Sep",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Oct",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Nov",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Dec",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

const dashboardComponents = [
  {
    title: "MRR",
    value: "$4,250",
    valueChange: '',
    timeseries: data
  },
  {
    title: "Active Users",
    value: "250",
    valueChange: '+20.1%',
    timeseries: data
  },
];
