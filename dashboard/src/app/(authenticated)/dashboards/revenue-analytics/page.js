"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { formatMoney, formatNumbers, formatShrinkMoney, formatShrinkNumbers } from "@/lib/utils/numberHelpers";
import Link from 'next/link'
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import RevenueRetentionWidget from '@/components/Dashboards/Components/RevenueRetentionWidget';
import { RxBarChart } from 'react-icons/rx'
import { setStateFromTimeseriesResponse } from "@/lib/utils/timeseriesHelpers";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useState, useEffect } from "react";
import Heatmap from "@/components/Dashboards/Components/HeatMap";

export default function PageMetrics() {
  const [activeSubscriptionsChartData, setActiveSubscriptionsChartData] = useState();
  const [churnedMrrChartData, setChurnedMrrChartData] = useState();
  const [churnRateChartData, setChurnRateChartData] = useState();
  // const [customersWithPaidSubscriptionsChartData, setCustomersWithPaidSubscriptionsChartData] = useState();
  const [customersChartData, setCustomersChartData] = useState();
  const [freeTrialsChartData, setFreeTrialsChartData] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mrrChartData, setMrrChartData] = useState();
  const [revenuePerCustomerChartData, setRevenuePerCustomerChartData] = useState();
  const [revenueRetentionData, setRevenueRetentionData] = useState();
  const [heatmapData, setHeatmapData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');

  const getBillingData = async timeframe => {
    return await SwishjamAPI.BillingData.timeseries({ timeframe }).then(
      ({ mrr, active_subscriptions }) => {
        setStateFromTimeseriesResponse(mrr, setMrrChartData);
        setStateFromTimeseriesResponse(active_subscriptions, setActiveSubscriptionsChartData);
        // setStateFromTimeseriesResponse(customers_with_paid_subscriptions, setCustomersWithPaidSubscriptionsChartData);
      },
    );
  };

  const getRevenueRetentionData = async () => {
    return await SwishjamAPI.SaasMetrics.Revenue.retention({ numCohorts: 8 }).then(setRevenueRetentionData)
  }

  const getRevenuePerCustomerData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.Revenue.perCustomerTimeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setRevenuePerCustomerChartData))
  }

  const getCustomersChartData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.Customers.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setCustomersChartData));
  }

  const getFreeTrialsChartData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.FreeTrials.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setFreeTrialsChartData));
  }

  const getChurnRateChartData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.ChurnRate.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setChurnRateChartData));
  }

  const getChurnedMrrChartData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.Churn.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setChurnedMrrChartData));
  }

  const getHeatmapData = async metric => {
    return await SwishjamAPI.SaasMetrics.Revenue.heatmap().then(setHeatmapData)
  }

  const getAllData = async timeframe => {
    setIsRefreshing(true);

    setMrrChartData();
    setActiveSubscriptionsChartData();
    // setCustomersWithPaidSubscriptionsChartData();
    setRevenueRetentionData();
    setRevenuePerCustomerChartData();
    setCustomersChartData();
    setFreeTrialsChartData();
    setChurnRateChartData();
    setChurnedMrrChartData();
    setHeatmapData();

    await Promise.all([
      getBillingData(timeframe),
      getRevenuePerCustomerData(timeframe),
      getCustomersChartData(timeframe),
      getFreeTrialsChartData(timeframe),
      getChurnRateChartData(timeframe),
      getChurnedMrrChartData(timeframe),
      getHeatmapData(),
      getRevenueRetentionData(),
    ])

    setIsRefreshing(false);
  };

  useEffect(() => {
    getAllData(timeframeFilter);
  }, [timeframeFilter]);

  return (
    <main className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flex grid grid-cols-2 items-center">
        <div>
          <Link href="/dashboards" className="mb-0 text-xs font-medium text-gray-400 flex hover:text-swishjam transition duration-300 hover:underline">
            <RxBarChart size={16} className="mr-1" />Dashboards
          </Link>
          <h1 className="mb-0 text-lg font-medium text-gray-700">
            Revenue Analytics
          </h1>
        </div>

        <div className="flex w-full items-center justify-end">
          <Button
            variant="ghost"
            className={`duration-500 transition-all mr-4 hover:text-swishjam ${isRefreshing ? "cursor-not-allowed text-swishjam" : ""}`}
            onClick={() => getAllData(timeframeFilter)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Timefilter selection={timeframeFilter} onSelection={setTimeframeFilter} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-8">
        <LineChartWithValue
          groupedBy={mrrChartData?.groupedBy}
          previousValue={mrrChartData?.previousValue}
          previousValueDate={mrrChartData?.previousValueDate}
          showAxis={false}
          timeseries={mrrChartData?.timeseries}
          title='MRR'
          value={mrrChartData?.value}
          valueFormatter={formatMoney}
          yAxisFormatter={formatShrinkMoney}
        />
        <LineChartWithValue
          groupedBy={activeSubscriptionsChartData?.groupedBy}
          previousValue={activeSubscriptionsChartData?.previousValue}
          previousValueDate={activeSubscriptionsChartData?.previousValueDate}
          showAxis={false}
          timeseries={activeSubscriptionsChartData?.timeseries}
          title='Active Subscriptions'
          value={activeSubscriptionsChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          DocumentationContent={
            <>
              <p className='mb-2'>
                <strong className='block'>Definition:</strong>Churn rate measures the percent of subscribers who have canceled their subscriptions during a rolling 30 day period.
              </p>
              <p className='mb-2'>
                <strong className='block'>Example:</strong>If you had 100 paying subscribers on December 1st, and 10 of them canceled their subscriptions between then and December 30th, your churn rate for December 30th would be 10% (10/100 = 0.1).
              </p>
              <p className='mb-2'>
                <strong className='block'>Formula:</strong> <span className='italic'># of churns over the last 30 days</span> / <span className='italic'># of Subscribers 30 days ago</span>
              </p>
            </>
          }
          groupedBy={churnRateChartData?.groupedBy}
          previousValue={churnRateChartData?.previousValue}
          previousValueDate={churnRateChartData?.previousValueDate}
          showAxis={false}
          timeseries={churnRateChartData?.timeseries}
          title='Churn Rate'
          value={churnRateChartData?.value}
          valueFormatter={n => `${n.toFixed(2)}%`}
          yAxisFormatter={n => `${n.toFixed(2)}%`}
        />
      </div>
      <div className='grid grid-cols-8 gap-2 pt-2'>
        <div className="col-span-8">
          <RevenueRetentionWidget includeInAppDocs={true} isExpandable={false} retentionCohorts={revenueRetentionData} />
        </div>
        {/* <div className="col-span-4">
          <RetentionWidget title="Customer Retention" retentionCohorts={{}} />
        </div> */}
      </div>

      <div className='grid grid-cols-4 gap-2 pt-2'>
        <LineChartWithValue
          DocumentationContent={
            <>
              <p className='mb-2'>
                <strong className='block'>Definition:</strong>
                Measures the average amount of monthly recurring revenue generated per subscriber.
                A subscriber is defined as someone who is currently paying for a subscription.
              </p>
              <p className='mb-2'>
                <strong className='block'>Example:</strong>
                If you have 100 subscribers with $1,000 in MRR, your average MRR per subscriber would be $10.
              </p>
              <p className='mb-2'>
                <strong className='block'>Formula:</strong> <span className='italic'>MRR</span> / <span className='italic'># of Subscribers</span>
              </p>
            </>
          }
          groupedBy={revenuePerCustomerChartData?.groupedBy}
          previousValue={revenuePerCustomerChartData?.previousValue}
          previousValueDate={revenuePerCustomerChartData?.previousValueDate}
          showAxis={false}
          timeseries={revenuePerCustomerChartData?.timeseries}
          title='Average MRR per Subscriber'
          value={revenuePerCustomerChartData?.value}
          valueFormatter={formatMoney}
          yAxisFormatter={formatShrinkMoney}
        />
        <LineChartWithValue
          groupedBy={customersChartData?.groupedBy}
          previousValue={customersChartData?.previousValue}
          previousValueDate={customersChartData?.previousValueDate}
          showAxis={false}
          timeseries={customersChartData?.timeseries}
          title='New Subscribers'
          value={customersChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={freeTrialsChartData?.groupedBy}
          previousValue={freeTrialsChartData?.previousValue}
          previousValueDate={freeTrialsChartData?.previousValueDate}
          showAxis={false}
          timeseries={freeTrialsChartData?.timeseries}
          title='Free Trials Started'
          value={freeTrialsChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          DocumentationContent={
            <p className='mb-2'>
              The number of customers who have churned in the selected timeframe.
              Churn is defined as a customer who has canceled their subscription.
              This metric is useful for understanding how many customers you are losing.
            </p>
          }
          groupedBy={churnedMrrChartData?.groupedBy}
          previousValue={churnedMrrChartData?.previousValue}
          previousValueDate={churnedMrrChartData?.previousValueDate}
          showAxis={false}
          timeseries={churnedMrrChartData?.timeseries}
          title='Churned MRR'
          value={churnedMrrChartData?.value}
          valueFormatter={formatMoney}
          yAxisFormatter={formatShrinkMoney}
        />
      </div>

      <div className='grid grid-cols-2 gap-2 pt-2'>
        <div className='col-span-2'>
          <Heatmap data={heatmapData} />
        </div>
      </div>

      {/* <div className='grid grid-cols-2 gap-2 pt-2'>
        <BarList title="Top Customers By Revenue" />
        <BarList title="Zombie Customers (Paid but not active users)" />
      </div> */}

    </main >
  );
}
