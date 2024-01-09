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
import { formatNumbers, formatShrinkNumbers } from "@/lib/utils/numberHelpers";
import RevenueRetentionWidget from '@/components/Dashboards/Components/RevenueRetentionWidget';

export default function PageMetrics() {
  const [activeCustomersChartData, setActiveCustomersChartData] = useState();
  const [activeSubscriptionsChartData, setActiveSubscriptionsChartData] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mrrChartData, setMrrChartData] = useState();
  const [revenueRetentionData, setRevenueRetentionData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');

  const getBillingData = async timeframe => {
    return await SwishjamAPI.BillingData.timeseries({ timeframe }).then(
      ({ mrr, active_subscriptions }) => {
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
      },
    );
  };

  const getRevenueRetentionData = () => {
    return SwishjamAPI.SaasMetrics.RevenueRetention.get({ numCohorts: 8 }).then(setRevenueRetentionData)
  }


  const getAllData = async timeframe => {
    // Reset All Data
    setIsRefreshing(true);
    setMrrChartData();
    setActiveSubscriptionsChartData();
    setActiveCustomersChartData();
    setRevenueRetentionData();

    // Reload all the data
    await Promise.all([
      getBillingData(timeframe),
      getRevenueRetentionData(),
    ]);

    setIsRefreshing(false);
  };

  useEffect(() => {
    getAllData(timeframeFilter);
  }, []);

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
          <Timefilter
            selection={timeframeFilter}
            onSelection={date => {
              setTimeframeFilter(date);
              getAllData(date);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-8">
        <LineChartWithValue
          groupedBy={mrrChartData?.groupedBy}
          previousValue={mrrChartData?.previousValue}
          previousValueDate={mrrChartData?.previousValueDate}
          showAxis={false}
          timeseries={mrrChartData?.timeseries}
          title={'Current MRR'}
          value={mrrChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={activeSubscriptionsChartData?.groupedBy}
          previousValue={activeSubscriptionsChartData?.previousValue}
          previousValueDate={activeSubscriptionsChartData?.previousValueDate}
          showAxis={false}
          timeseries={activeSubscriptionsChartData?.timeseries}
          title={'Active Subscriptions'}
          value={activeSubscriptionsChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={activeCustomersChartData?.groupedBy}
          previousValue={activeCustomersChartData?.previousValue}
          previousValueDate={activeCustomersChartData?.previousValueDate}
          showAxis={false}
          timeseries={activeCustomersChartData?.timeseries}
          title={'Active Customers'}
          value={activeCustomersChartData?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
      </div>
      <div className='grid grid-cols-8 gap-2 pt-2'>
        <div className="col-span-8">
          <RevenueRetentionWidget
            title="Revenue Retention"
            retentionCohorts={revenueRetentionData}
          />
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
          // groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          // previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          // previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          // showAxis={false}
          // timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title='Avg. Revenue/Customer'
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
          title='New Customers'
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
