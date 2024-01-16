"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BsCloudSlash } from "react-icons/bs";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import ActiveUsersLineChartWithValue from "@/components/Dashboards/Components/ActiveUsersLineChartWithValue";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import ItemizedList from "@/components/Dashboards/Components/ItemizedList";
import RetentionWidgetTiny from "@/components/Dashboards/Components/RetentionWidgetTiny";
import { BsArrowRightShort } from "react-icons/bs";
import { formatMoney, formatNumbers, formatShrinkNumbers, formatShrinkMoney } from "@/lib/utils/numberHelpers";
import { setStateFromTimeseriesResponse, setStateFromMultiDimensionalTimeseriesResponse, formattedUTCMonthAndDay } from "@/lib/utils/timeseriesHelpers";

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");

  // SaaS Metrics Data
  const [mrrChart, setMrrChart] = useState();
  const [activeSubsChart, setActiveSubsChart] = useState();
  const [churnRateData, setChurnRateData] = useState();

  // Marketing Analytics Data
  const [pageViewsTimeseriesData, setPageViewsTimeseriesData] = useState();
  const [sessionsMarketingChart, setSessionsMarketingChart] = useState();
  const [uniqueVisitorsMarketingChartData, setUniqueVisitorsMarketingChartData] = useState();
  const [uniqueVisitorsMarketingGrouping, setUniqueVisitorsMarketingGrouping] = useState("daily");

  // Product Analytics data
  const [newUsersChartData, setNewUsersChartData] = useState();
  const [uniqueVisitorsProductChartData, setUniqueVisitorsProductChartData] = useState();
  const [uniqueVisitorsProductGrouping, setUniqueVisitorsProductGrouping] = useState("weekly");
  const [userRetentionData, setUserRetentionData] = useState();

  // Other
  const [newOrganizationsData, setNewOrganizationsData] = useState();
  const [newUsersData, setNewUsersData] = useState();

  const getBillingData = async (timeframe) => {
    return await SwishjamAPI.BillingData.timeseries({ timeframe }).then(({ mrr, active_subscriptions }) => {
      setStateFromTimeseriesResponse(mrr, setMrrChart);
      setStateFromTimeseriesResponse(active_subscriptions, setActiveSubsChart);
    });
  };

  const getChurnRateData = async (timeframe) => {
    return await SwishjamAPI.SaasMetrics.ChurnRate.timeseries({ timeframe, excludeComparison: true }).then(resp => setStateFromMultiDimensionalTimeseriesResponse(resp, setChurnRateData));
  };

  const getPageViewsTimeseriesData = async (timeframe) => {
    return await SwishjamAPI.PageViews.timeseries({ timeframe, dataSource: "marketing" }).then(timeseriesData => {
      setStateFromTimeseriesResponse(timeseriesData, setPageViewsTimeseriesData)
    });
  };

  const getSessionsMarketingData = async (timeframe) => {
    return await SwishjamAPI.Sessions.timeseries({ dataSource: "marketing", timeframe }).then(timeseriesData => {
      setStateFromTimeseriesResponse(timeseriesData, setSessionsMarketingChart)
    });
  };

  const getNewUsersChartData = async (timeframe) => {
    return await SwishjamAPI.Users.timeseries({ timeframe }).then((newUserData) => {
      setStateFromTimeseriesResponse(newUserData, setNewUsersChartData);
    });
  };

  const getUniqueVisitorsMarketingData = async (timeframe, type) => {
    return await SwishjamAPI.Users.Active.timeseries({ timeframe, dataSource: "marketing", type, include_comparison: true }).then(timeseriesData => {
      setStateFromTimeseriesResponse(timeseriesData, setUniqueVisitorsMarketingChartData)
    });
  };

  const getUniqueVisitorsProductData = async (timeframe, type) => {
    return await SwishjamAPI.Users.Active.timeseries({ timeframe, dataSource: "product", type, include_comparison: true }).then(timeseriesData => {
      setStateFromTimeseriesResponse(timeseriesData, setUniqueVisitorsProductChartData)
    });
  };

  const getUserRetentionData = async () => {
    return await SwishjamAPI.RetentionCohorts.get().then(setUserRetentionData);
  };

  const getUsersData = async () => {
    return await SwishjamAPI.Users.list({ limit: 5 }).then(({ users }) => setNewUsersData(users));
  };

  const getOrganizationsData = async () => {
    return await SwishjamAPI.Organizations.list({ limit: 5 }).then(({ organizations }) => setNewOrganizationsData(organizations));
  };

  const getAllData = async (timeframe) => {
    setIsRefreshing(true);
    // Product
    setNewUsersChartData();
    setUniqueVisitorsProductChartData();
    setUserRetentionData();
    // Marketing
    setUniqueVisitorsMarketingChartData();
    setPageViewsTimeseriesData();
    setSessionsMarketingChart();
    // SaaS Metrics
    setMrrChart();
    setActiveSubsChart();
    setChurnRateData();

    // Users & Orgs
    setNewUsersData();
    setNewOrganizationsData();
    await Promise.all([
      getPageViewsTimeseriesData(timeframe),
      getSessionsMarketingData(timeframe),
      getUniqueVisitorsMarketingData(timeframe, uniqueVisitorsMarketingGrouping),
      getUniqueVisitorsProductData(timeframe, uniqueVisitorsProductGrouping),
      getNewUsersChartData(timeframe),
      getUserRetentionData(),
      getBillingData(timeframe),
      getChurnRateData(timeframe),
      getUsersData(),
      getOrganizationsData(),
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    getAllData(timeframeFilter);
  }, [timeframeFilter]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      {/* <InstallBanner hidden={isRefreshing || parseInt(sessionsMarketingChart?.value) > 0 || parseFloat(mrrChart?.value) > 0 || parseInt(activeSubsChart?.value) > 0} /> */}
      <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Button
            variant="ghost"
            className={`duration-500 transition-all mr-4 hover:text-swishjam ${isRefreshing ? "cursor-not-allowed text-swishjam" : ""}`}
            onClick={() => getAllData(timeframeFilter)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Timefilter selection={timeframeFilter} onSelection={timeframe => { setTimeframeFilter(timeframe); getAllData(timeframe) }} />
        </div>
      </div>

      <div className="pt-8 flex justify-between">
        <h3 className="font-semibold text-sm text-slate-600">
          Key Product Metrics
        </h3>
        <Link href="/dashboards/product-analytics" className="group">
          <h3 className="font-semibold text-sm text-slate-600 group-hover:text-swishjam transition-all duration-500">
            Deep Dive Report <BsArrowRightShort size={24} className="inline" />
          </h3>
        </Link>
      </div>
      <div className='grid grid-cols-3 gap-2 pt-2'>
        <ActiveUsersLineChartWithValue
          data={uniqueVisitorsProductChartData}
          selectedGrouping={uniqueVisitorsProductGrouping}
          valueFormatter={formatNumbers}
          showAxis={false}
          onGroupingChange={(group) => {
            setUniqueVisitorsProductChartData();
            setUniqueVisitorsProductGrouping(group);
            getUniqueVisitorsProductData(timeframeFilter, group);
          }}
        />
        <LineChartWithValue
          title="New Users"
          value={newUsersChartData?.value}
          previousValue={newUsersChartData?.previousValue}
          previousValueDate={newUsersChartData?.previousValueDate}
          showAxis={false}
          timeseries={newUsersChartData?.timeseries}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <RetentionWidgetTiny retentionCohorts={userRetentionData} isExpandable={false} />
      </div>
      <div className="pt-8 flex justify-between">
        <h3 className="font-semibold text-sm text-slate-600">
          Key Revenue Metrics
        </h3>
        <Link href="/dashboards/revenue-analytics" className="group opacity-50">
          <h3 className="font-semibold text-sm text-slate-600 group-hover:text-swishjam transition-all duration-500">
            Deep Dive Report <BsArrowRightShort size={24} className="inline" />
          </h3>
        </Link>
      </div>
      <div className='grid grid-cols-3 gap-2 pt-2'>
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
          additionalTooltipDataFormatter={d => (
            <>
              <strong>{d.num_churned_subscriptions_in_period}</strong> of the <strong>{d.num_active_subscriptions_at_snapshot_date + d.num_new_subscriptions_in_period}</strong> subscriptions that were active on {formattedUTCMonthAndDay(d.snapshot_date)} churned between then and {formattedUTCMonthAndDay(d.date)}.
            </>
          )}
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
          groupedBy={churnRateData?.groupedBy}
          previousValue={churnRateData?.previousValue}
          previousValueDate={churnRateData?.previousValueDate}
          showAxis={false}
          timeseries={churnRateData?.timeseries}
          title='Churn Rate'
          value={churnRateData?.value}
          valueFormatter={n => `${n.toFixed(2)}%`}
          valueKey='churn_rate'
          yAxisFormatter={n => `${n.toFixed(2)}%`}
        />
        {/* <LineChartWithValue
          title="Churn Rate"
          value={churnRateData?.value}
          valueFormatter={percent => `${percent}%`}
          showAxis={false}
          timeseries={churnRateData?.timeseries}
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
        /> */}
      </div>
      <div className="pt-8 flex justify-between">
        <h3 className="font-semibold text-sm text-slate-600">
          Key Marketing Metrics
        </h3>
        <Link href="/dashboards/marketing-analytics" className="group">
          <h3 className="font-semibold text-sm text-slate-600 group-hover:text-swishjam transition-all duration-500">
            Deep Dive Report <BsArrowRightShort size={24} className="inline" />
          </h3>
        </Link>
      </div>
      <div className='grid grid-cols-3 gap-2 pt-2'>
        <LineChartWithValue
          title="Sessions"
          value={sessionsMarketingChart?.value}
          previousValue={sessionsMarketingChart?.previousValue}
          previousValueDate={sessionsMarketingChart?.previousValueDate}
          showAxis={true}
          timeseries={sessionsMarketingChart?.timeseries}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          title="Page Views"
          value={pageViewsTimeseriesData?.value}
          previousValue={pageViewsTimeseriesData?.previousValue}
          previousValueDate={pageViewsTimeseriesData?.previousValueDate}
          showAxis={true}
          timeseries={pageViewsTimeseriesData?.timeseries}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          title="Unique Visitors"
          value={uniqueVisitorsMarketingChartData?.value}
          previousValue={uniqueVisitorsMarketingChartData?.previousValue}
          previousValueDate={
            uniqueVisitorsMarketingChartData?.previousValueDate
          }
          showAxis={true}
          timeseries={uniqueVisitorsMarketingChartData?.timeseries}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
      </div>
      {/*<div className='pt-8'>
        <RetentionWidget retentionCohorts={userRetentionData} />
      </div>*/}
      <h3 className='pt-8 font-semibold text-sm text-slate-600'>New Users & Organizations</h3>
      <div className='grid grid-cols-2 gap-2 pt-2'>
        <ItemizedList
          fallbackAvatarGenerator={user => user?.initials?.slice(0, 2) || ""}
          items={newUsersData}
          titleFormatter={user => user.full_name || user.email || user.user_unique_identifier}
          subTitleFormatter={user => (user.full_name ? user.email : null)}
          linkFormatter={user => `/users/${user.swishjam_user_id}`}
          rightItemKey="created_at"
          rightItemKeyFormatter={date => {
            return new Date(date)
              .toLocaleDateString("en-us", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              .replace(`, ${new Date(date).getFullYear()}`, "");
          }}
          title="New Users"
          viewMoreUrl="/users"
          maxNumItems={5}
        />
        <ItemizedList
          fallbackAvatarGenerator={org => org?.initials?.slice(0, 2) || ""}
          items={newOrganizationsData}
          titleFormatter={(org) => org.name || org.organization_unique_identifier}
          linkFormatter={(org) => `/organizations/${org.id}`}
          noDataMsg="No organizations identified yet."
          rightItemKey="created_at"
          rightItemKeyFormatter={(date) => {
            return new Date(date)
              .toLocaleDateString("en-us", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              .replace(`, ${new Date(date).getFullYear()}`, "");
          }}
          title="New Organizations"
          viewMoreUrl="/organizations"
          maxNumItems={5}
        />
      </div>
    </main>
  );
}
