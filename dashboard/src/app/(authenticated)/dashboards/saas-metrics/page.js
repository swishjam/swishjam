'use client'

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import BarChartComponent from "@/components/Dashboards/Components/BarChart";
import { BsCloudSlash } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { formatMoney, formatNumbers, formatShrinkNumbers, formatShrinkMoney } from "@/lib/utils/numberHelpers";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import Link from "next/link"
import { RxBarChart } from "react-icons/rx"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { useEffect, useState } from "react";


export default function SaasMetrics() {
  const [activeSubsChart, setActiveSubsChart] = useState();
  const [churnRateData, setChurnRateData] = useState();
  const [mrrChart, setMrrChart] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mrrMovementData, setMrrMovementData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");

  const getMrrMovementData = async timeframe => {
    return await SwishjamAPI.SaasMetrics.MrrMovement.stackedBarChart({ timeframe }).then(mrrMovementData => {
      const mrrMovementByDateDict = {};
      mrrMovementData.forEach(({ movement_amount, movement_type, grouped_by_date }) => {
        if (mrrMovementByDateDict[grouped_by_date]) {
          mrrMovementByDateDict[grouped_by_date][movement_type] = mrrMovementByDateDict[grouped_by_date][movement_type] || 0;
          mrrMovementByDateDict[grouped_by_date][movement_type] += movement_amount;
        } else {
          mrrMovementByDateDict[grouped_by_date] = { [movement_type]: movement_amount };
        }
      })
      const formattedMrrMovementData = Object.keys(mrrMovementByDateDict).map(date => {
        const { new: new_business, 'reactivation': re_activation, expansion, contraction, churn } = mrrMovementByDateDict[date];
        return {
          date,
          'New Business': new_business || 0,
          'Expansion': expansion || 0,
          'Reactivation': re_activation || 0,
          'Contraction': contraction || 0,
          'Churn': churn || 0,
        }
      })
      setMrrMovementData(formattedMrrMovementData)
    })
  }

  const getBillingData = async (timeframe) => {
    return await SwishjamAPI.BillingData.timeseries({ timeframe }).then(
      ({ mrr, active_subscriptions }) => {
        setMrrChart({
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

        setActiveSubsChart({
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

  const getChurnRateData = async (timeframe) => {
    return await SwishjamAPI.SaasMetrics.ChurnRate.timeseries({ includeComparison: true, timeframe }).then(({ timeseries, comparison_timeseries, error }) => {
      if (!error) {
        setChurnRateData({
          value: timeseries[timeseries.length - 1].churn_rate,
          groupedBy: 'day',
          timeseries: timeseries.map((dataPoint, index) => ({
            date: dataPoint.churn_period_end_date,
            value: dataPoint.churn_rate,
            comparisonDate: (comparison_timeseries || [])[index]?.churn_period_end_date,
            comparisonValue: (comparison_timeseries || [])[index]?.churn_rate,
          })),
        });
      }
    });
  };

  const getAllData = async timeframe => {
    setIsRefreshing(true);
    setMrrMovementData();
    await Promise.all([
      getMrrMovementData(timeframe),
      getBillingData(timeframe),
      getChurnRateData(timeframe),
    ])
    setIsRefreshing(false);
  }

  useEffect(() => {
    getAllData(timeframeFilter);
  }, [timeframeFilter])

  return (
    <main className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flex grid grid-cols-2 items-center">
        <div>
          <Link href="/dashboards" className="mb-0 text-xs font-medium text-gray-400 flex hover:text-swishjam transition duration-300 hover:underline">
            <RxBarChart size={16} className="mr-1" />Dashboards
          </Link>
          <h1 className="mb-0 text-lg font-medium text-gray-700">
            SaaS Metrics
          </h1>
        </div>
        <div className="flex w-full items-center justify-end">
          <Timefilter
            selection={timeframeFilter}
            onSelection={setTimeframeFilter}
          />
          <Button
            variant="outline"
            className={`ml-4 bg-white ${isRefreshing ? "cursor-not-allowed" : ""}`}
            onClick={() => getAllData(timeframeFilter)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-8">
        <LineChartWithValue
          title="MRR"
          value={mrrChart?.value}
          previousValue={mrrChart?.previousValue}
          previousValueDate={mrrChart?.previousValueDate}
          noDataMessage={
            <div className="text-center">
              <BsCloudSlash size={24} className="text-gray-500 m-auto" />
              No data available,{" "}
              <Link
                className="underline text-blue-700 cursor-pointer"
                href="/data-sources"
              >
                connect your Stripe account
              </Link>{" "}
              to get started.
            </div>
          }
          valueFormatter={formatMoney}
          yAxisFormatter={formatShrinkMoney}
          showAxis={false}
          timeseries={mrrChart?.timeseries}
        />
        <LineChartWithValue
          title="Active Subscriptions"
          showAxis={false}
          timeseries={activeSubsChart?.timeseries}
          noDataMessage={
            <div className="text-center">
              <BsCloudSlash size={24} className="text-gray-500 m-auto" />
              No data available,{" "}
              <Link
                className="underline text-blue-700 cursor-pointer"
                href="/data-sources"
              >
                connect your Stripe account
              </Link>{" "}
              to get started.
            </div>
          }
          value={activeSubsChart?.value}
          previousValue={activeSubsChart?.previousValue}
          previousValueDate={activeSubsChart?.previousValueDate}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          title="Churn Rate"
          value={churnRateData?.value}
          // previousValue={0}
          // previousValueDate={new Date()}
          valueFormatter={percent => `${percent}%`}
          // yAxisFormatter={formatShrinkMoney}
          showAxis={false}
          timeseries={churnRateData?.timeseries}
        // className={"opacity-50"}
        />
      </div>
      <div className='mt-8 grid grid-cols-2 gap-4'>
        <BarChartComponent
          colorsByKey={{
            'New Business': 'green',
            'Expansion': 'lightgreen',
            'Reactivation': 'lime',
            'Contraction': '#ff7777',
            'Churn': 'red',
          }}
          data={mrrMovementData}
          stackOffset="sign"
          title="MRR Movement"
          yAxisFormatter={formatShrinkMoney}
        />
      </div>
    </main>
  )
}