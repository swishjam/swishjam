"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { formatMoney, formatNumbers, formatShrinkMoney, formatShrinkNumbers } from "@/lib/utils/numberHelpers";
import Heatmap from "@/components/Dashboards/Components/HeatMap";
import Image from "next/image";
import Link from 'next/link'
import LineChartWithValue from "@/components/Dashboards/Components/AreaChartWithValue";
import Modal from "@/components/utils/Modal";
import RevenueRetentionWidget from '@/components/Dashboards/Components/RevenueRetentionWidget';
import { RxBarChart } from 'react-icons/rx'
import { formattedUTCMonthAndDay, setStateFromMultiDimensionalTimeseriesResponse, setStateFromTimeseriesResponse } from "@/lib/utils/timeseriesHelpers";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import useAuthData from "@/hooks/useAuthData";
import { useState, useEffect } from "react";

export default function PageMetrics() {
  const [activeSubscriptionsChartData, setActiveSubscriptionsChartData] = useState();
  const [churnedMrrChartData, setChurnedMrrChartData] = useState();
  const [churnRateChartData, setChurnRateChartData] = useState();
  // const [customersWithPaidSubscriptionsChartData, setCustomersWithPaidSubscriptionsChartData] = useState();
  const [customersChartData, setCustomersChartData] = useState();
  const [freeTrialsChartData, setFreeTrialsChartData] = useState();
  const [isMissingStripeConnection, setIsMissingStripeConnection] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mrrChartData, setMrrChartData] = useState();
  const [revenuePerCustomerChartData, setRevenuePerCustomerChartData] = useState();
  const [revenueRetentionData, setRevenueRetentionData] = useState();
  const [heatmapData, setHeatmapData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState('thirty_days');

  const { token } = useAuthData();
  const redirectUrlHost = process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URL_HOST || 'https://capture.swishjam.com';
  const stripeClientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID || 'ca_ONSwyVU8wOJ9ZvJ06DmBcx83cvJsGujT';

  const getBillingData = async (timeframe, groupBy) => {
    setMrrChartData();
    setActiveSubscriptionsChartData();
    return await SwishjamAPI.BillingData.timeseries({ timeframe, groupBy }).then(
      ({ mrr, active_subscriptions }) => {
        setStateFromTimeseriesResponse(mrr, setMrrChartData);
        setStateFromTimeseriesResponse(active_subscriptions, setActiveSubscriptionsChartData);
        // setStateFromTimeseriesResponse(customers_with_paid_subscriptions, setCustomersWithPaidSubscriptionsChartData);
      },
    );
  };

  const getRevenueRetentionData = async () => {
    setRevenueRetentionData();
    return await SwishjamAPI.SaasMetrics.Revenue.retention({ numCohorts: 8 }).then(setRevenueRetentionData)
  }

  const getRevenuePerCustomerData = async timeframe => {
    setRevenuePerCustomerChartData();
    return await SwishjamAPI.SaasMetrics.Revenue.perCustomerTimeseries({ timeframe }).then(resp => setStateFromMultiDimensionalTimeseriesResponse(resp, setRevenuePerCustomerChartData));
  }

  const getCustomersChartData = async timeframe => {
    setCustomersChartData();
    return await SwishjamAPI.SaasMetrics.Customers.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setCustomersChartData));
  }

  const getFreeTrialsChartData = async timeframe => {
    setFreeTrialsChartData();
    return await SwishjamAPI.SaasMetrics.FreeTrials.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setFreeTrialsChartData));
  }

  const getChurnRateChartData = async timeframe => {
    setChurnRateChartData();
    return await SwishjamAPI.SaasMetrics.ChurnRate.timeseries({ timeframe, excludeComparison: true }).then(resp => setStateFromMultiDimensionalTimeseriesResponse(resp, setChurnRateChartData));
  }

  const getChurnedMrrChartData = async timeframe => {
    setChurnedMrrChartData();
    return await SwishjamAPI.SaasMetrics.Churn.timeseries({ timeframe }).then(resp => setStateFromTimeseriesResponse(resp, setChurnedMrrChartData));
  }

  const getHeatmapData = async () => {
    setHeatmapData();
    return await SwishjamAPI.SaasMetrics.Revenue.heatmap().then(resp => {
      if (resp.error && /Stripe is not configured for this account/i.test(resp.error)) {
        setIsMissingStripeConnection(true)
      } else {
        setHeatmapData(resp)
      }
    })
  }

  const getAllData = async timeframe => {
    setIsRefreshing(true);
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
      {isMissingStripeConnection && (
        <Modal isOpen={true} size='large' title='Connect your Stripe account' closable={false}>
          <div className='text-center'>
            <Image className='rounded-md m-auto' src='/logos/stripe.jpeg' width={100} height={100} />
            <h1 className='text-md mt-4 text-gray-700'>Connect your Stripe account in order to get access to Swishjam Revenue Analytics.</h1>
            <a
              className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
              href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${redirectUrlHost}/oauth/stripe/callback&state={"authToken":"${token}","redirectPath":"/dashboards/revenue-analytics"}`}
            >
              Connect Stripe
            </a>
            <span className='text-xs text-gray-700'>or</span>
            <Link
              className='w-full flex justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 bg-white hover:bg-gray-100'
              href='/'
            >
              Go home
            </Link>
          </div>
        </Modal>
      )}
      <div className="mt-8 grid grid-cols-2 items-center">
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
          DocumentationContent={<><span className='italic'>MRR</span> is defined as the total amount of monthly recurring revenue generated by your active subscribers. Swishjam calculates this based on your Stripe subscriptions and is normalized to a monthly value.</>}
          groupedBy={mrrChartData?.groupedBy}
          onGroupByChange={group => getBillingData(timeframeFilter, group)}
          showAxis={false}
          timeseries={mrrChartData?.timeseries}
          title='MRR'
          valueFormatter={formatMoney}
          yAxisFormatter={formatShrinkMoney}
        />
        <LineChartWithValue
          DocumentationContent={<>An <span className='italic'>Active Subscriber</span> is defined as someone who has an active, non-canceled subscription worth more than $0.</>}
          groupedBy={activeSubscriptionsChartData?.groupedBy}
          onGroupByChange={group => getBillingData(timeframeFilter, group)}
          showAxis={false}
          timeseries={activeSubscriptionsChartData?.timeseries}
          title='Active Subscriptions'
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          additionalTooltipDataFormatter={d => <><strong>{d.num_churned_subscriptions_in_period}</strong> of the <strong>{d.num_active_subscriptions_at_snapshot_date + d.num_new_subscriptions_in_period}</strong> subscriptions that were active on {formattedUTCMonthAndDay(d.snapshot_date)} churned between then and {formattedUTCMonthAndDay(d.date)}.</>}
          DocumentationContent={
            <>
              <p className='mb-2'>
                <strong className='block'>Definition:</strong>Churn rate measures the percent of subscriptions who have canceled their subscriptions during a rolling 30 day period. It is a common measurement for SaaS companies to understand how many customers they are losing.
              </p>
              <p className='mb-2'>
                <strong className='block'>Example:</strong>If you had 100 paid subscriptions on December 1st, you added 20 more subscriptions between December 1st and December 30th, and 12 subscriptions were canceled between then and December 30th, your churn rate for December 30th would be 10% (12/(100 + 20) = 0.1).
              </p>
              <p className='mb-2'>
                <strong className='block'>Formula:</strong> <span className='italic'># of churns over the last 30 days</span> / (<span className='italic'># of active subscriptions 30 days ago</span> + <span className='italic'># of new subscriptions over the last 30 days </span>)
              </p>
            </>
          }
          groupedBy={churnRateChartData?.groupedBy}
          showAxis={false}
          timeseries={churnRateChartData?.timeseries}
          title='Churn Rate'
          valueFormatter={n => `${n.toFixed(2)}%`}
          valueKey='churn_rate'
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
          additionalTooltipDataFormatter={d => (
            <>
              There was <strong>{d.num_customers_with_paid_subscriptions_at_time_of_snapshot} paying subscriber{d.num_customers_with_paid_subscriptions_at_time_of_snapshot === 1 ? '' : 's'}</strong>, and <strong>{formatMoney(d.mrr_at_time_of_snapshot)} in MRR</strong>.
            </>
          )}
          comparisonDateKey="comparison_date"
          comparisonValueKey="comparison_mrr_per_customer"
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
          showAxis={false}
          timeseries={revenuePerCustomerChartData?.timeseries}
          title='Average MRR / Subscriber'
          valueKey='mrr_per_customer'
          valueFormatter={formatMoney}
          yAxisFormatter={formatShrinkMoney}
        />
        <LineChartWithValue
          DocumentationContent={<><span className='italic'>New Subscribers</span> is equivalent to the number of <span className='italic'>Stripe Customers</span> created in the selected timeframe.</>}
          groupedBy={customersChartData?.groupedBy}
          showAxis={false}
          timeseries={customersChartData?.timeseries}
          title='New Subscribers'
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={freeTrialsChartData?.groupedBy}
          showAxis={false}
          timeseries={freeTrialsChartData?.timeseries}
          title='Free Trials Started'
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
          showAxis={false}
          timeseries={churnedMrrChartData?.timeseries}
          title='Churned MRR'
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
