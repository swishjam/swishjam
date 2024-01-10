"use client";

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { RxBarChart } from 'react-icons/rx'
import Link from 'next/link'
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
//import BarChart from "@/components/Dashboards/Components/BarChart";
import BarList from "@/components/Dashboards/Components/BarList";
import { formatMoney, formatNumbers, formatShrinkMoney, formatShrinkNumbers } from "@/lib/utils/numberHelpers";
import RevenueRetentionWidget from '@/components/Dashboards/Components/RevenueRetentionWidget';
import { setStateFromTimeseriesResponse } from "@/lib/utils/timeseriesHelpers";

export default function PageMetrics() {
  const [activeSubscriptionsChartData, setActiveSubscriptionsChartData] = useState();
  const [customersWithPaidSubscriptionsChartData, setCustomersWithPaidSubscriptionsChartData] = useState();
  const [customersChartData, setCustomersChartData] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mrrChartData, setMrrChartData] = useState();
  const [revenuePerCustomerChartData, setRevenuePerCustomerChartData] = useState();
  const [revenueRetentionData, setRevenueRetentionData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');

  const getBillingData = async timeframe => {
    return await SwishjamAPI.BillingData.timeseries({ timeframe }).then(
      ({ mrr, active_subscriptions, customers_with_paid_subscriptions }) => {
        setMrrChartData({
          value: mrr.current_count,
          previousValue: mrr.comparison_count,
          previousValueDate: mrr.comparison_end_time,
          groupedBy: mrr.grouped_by,
          timeseries: mrr.timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: mrr.comparison_timeseries[index]?.date,
            comparisonValue: mrr.comparison_timeseries[index]?.value,
          })),
        });

        setActiveSubscriptionsChartData({
          value: active_subscriptions.current_count,
          previousValue: active_subscriptions.comparison_count,
          previousValueDate: active_subscriptions.comparison_end_time,
          groupedBy: active_subscriptions.grouped_by,
          timeseries: active_subscriptions.timeseries.map(
            (timeseries, index) => ({
              ...timeseries,
              comparisonDate: active_subscriptions.comparison_timeseries[index]?.date,
              comparisonValue: active_subscriptions.comparison_timeseries[index]?.value,
            }),
          ),
        });

        setCustomersWithPaidSubscriptionsChartData({
          value: customers_with_paid_subscriptions.current_count,
          previousValue: customers_with_paid_subscriptions.comparison_count,
          previousValueDate: customers_with_paid_subscriptions.comparison_end_time,
          groupedBy: customers_with_paid_subscriptions.grouped_by,
          timeseries: customers_with_paid_subscriptions.timeseries.map(
            (timeseries, index) => ({
              ...timeseries,
              comparisonDate: customers_with_paid_subscriptions.comparison_timeseries[index]?.date,
              comparisonValue: customers_with_paid_subscriptions.comparison_timeseries[index]?.value,
            }),
          ),
        });
      },
    );
  };

  const getRevenueRetentionData = async () => {
    return await SwishjamAPI.SaasMetrics.RevenueRetention.get({ numCohorts: 8 }).then(setRevenueRetentionData)
  }

  const getRevenuePerCustomerData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.RevenuePerCustomer.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setRevenuePerCustomerChartData))
  }

  const getCustomersChartData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.Customers.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setCustomersChartData));
  }

  const getAllData = async timeframe => {
    // Reset All Data
    setIsRefreshing(true);
    setMrrChartData();
    setActiveSubscriptionsChartData();
    setCustomersWithPaidSubscriptionsChartData();
    setRevenueRetentionData();
    setRevenuePerCustomerChartData();
    setCustomersChartData();

    // Reload all the data
    await Promise.all([
      getBillingData(timeframe),
      getRevenuePerCustomerData(timeframe),
      getCustomersChartData(timeframe),
      getRevenueRetentionData(),
    ]);

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
            SaaS Analytics
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
          groupedBy={customersWithPaidSubscriptionsChartData?.groupedBy}
          previousValue={customersWithPaidSubscriptionsChartData?.previousValue}
          previousValueDate={customersWithPaidSubscriptionsChartData?.previousValueDate}
          showAxis={false}
          timeseries={customersWithPaidSubscriptionsChartData?.timeseries}
          title='Paying Customers'
          value={customersWithPaidSubscriptionsChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
      </div>
      <div className='grid grid-cols-8 gap-2 pt-2'>
        <div className="col-span-8">
          <RevenueRetentionWidget title="Revenue Retention" retentionCohorts={revenueRetentionData} />
        </div>
        {/* <div className="col-span-4">
          <RetentionWidget
            title="Customer Retention"
            retentionCohorts={{}}
          />
        </div> */}
      </div>

      <div className='grid grid-cols-4 gap-2 pt-2'>
        <LineChartWithValue
          groupedBy={revenuePerCustomerChartData?.groupedBy}
          previousValue={revenuePerCustomerChartData?.previousValue}
          previousValueDate={revenuePerCustomerChartData?.previousValueDate}
          showAxis={false}
          timeseries={revenuePerCustomerChartData?.timeseries}
          title='Revenue/Paid Customer'
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
          title='New Customers'
          value={customersChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          // groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          // previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          // previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          // timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'New Trials'}
          // value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          // groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          // previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          // previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          // timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title='Customer Churn'
          // value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
      </div>

      <div className='grid grid-cols-2 gap-2 pt-2'>
        <BarList
          title="Top Customers By Revenue"
        />
        <BarList
          title="Zombie Customers (Paid but not active users)"
        />
      </div>

    </main >
  );
}
