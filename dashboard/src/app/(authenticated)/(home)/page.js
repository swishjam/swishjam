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
import {
  formatMoney,
  formatNumbers,
  formatShrinkNumbers,
  formatShrinkMoney,
} from "@/lib/utils/numberHelpers";

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

  const getPageViewsTimeseriesData = async (timeframe) => {
    return await SwishjamAPI.PageViews.timeseries({
      timeframe,
      dataSource: "marketing",
    }).then(
      ({
        current_count,
        comparison_count,
        comparison_end_time,
        timeseries,
        comparison_timeseries,
        grouped_by,
      }) => {
        setPageViewsTimeseriesData({
          groupedBy: grouped_by,
          previousValue: comparison_count,
          previousValueDate: comparison_end_time,
          timeseries: timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
          value: current_count,
          valueChange: current_count - comparison_count,
        });
      },
    );
  };

  const getSessionsMarketingData = async (timeframe) => {
    return await SwishjamAPI.Sessions.timeseries({
      dataSource: "marketing",
      timeframe,
    }).then((sessionData) => {
      setSessionsMarketingChart({
        value: sessionData.current_count,
        previousValue: sessionData.comparison_count,
        previousValueDate: sessionData.comparison_end_time,
        valueChange: sessionData.count - sessionData.comparison_count,
        groupedBy: sessionData.grouped_by,
        timeseries: sessionData.timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: sessionData.comparison_timeseries[index]?.date,
          comparisonValue: sessionData.comparison_timeseries[index]?.value,
        })),
      });
    });
  };

  const getNewUsersChartData = async (timeframe) => {
    return await SwishjamAPI.Users.timeseries({ timeframe }).then(
      (newUserData) => {
        setNewUsersChartData({
          value: newUserData.current_count,
          previousValue: newUserData.comparison_count,
          previousValueDate: newUserData.comparison_end_time,
          valueChange: newUserData.count - newUserData.comparison_count,
          groupedBy: newUserData.grouped_by,
          timeseries: newUserData.timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: newUserData.comparison_timeseries[index]?.date,
            comparisonValue: newUserData.comparison_timeseries[index]?.value,
          })),
        });
      },
    );
  };

  const getUniqueVisitorsMarketingData = async (timeframe, type) => {
    return await SwishjamAPI.Users.Active.timeseries({
      timeframe,
      dataSource: "marketing",
      type,
      include_comparison: true,
    }).then(
      ({
        current_value,
        timeseries,
        comparison_value,
        comparison_timeseries,
        comparison_end_time,
        grouped_by,
      }) => {
        setUniqueVisitorsMarketingChartData({
          value: current_value || 0,
          previousValue: comparison_value || 0,
          previousValueDate: comparison_end_time,
          valueChange: (current_value || 0) - (comparison_value || 0),
          groupedBy: grouped_by,
          timeseries: timeseries?.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
        });
      },
    );
  };

  const getUniqueVisitorsProductData = async (timeframe, type) => {
    return await SwishjamAPI.Users.Active.timeseries({
      timeframe,
      dataSource: "product",
      type,
      include_comparison: true,
    }).then(
      ({
        current_value,
        timeseries,
        comparison_value,
        comparison_timeseries,
        comparison_end_time,
        grouped_by,
      }) => {
        setUniqueVisitorsProductChartData({
          value: current_value || 0,
          previousValue: comparison_value || 0,
          previousValueDate: comparison_end_time,
          valueChange: (current_value || 0) - (comparison_value || 0),
          groupedBy: grouped_by,
          timeseries: timeseries?.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
        });
      },
    );
  };

  const getUserRetentionData = async () => {
    return await SwishjamAPI.RetentionCohorts.get().then(setUserRetentionData);
  };

  const getUsersData = async () => {
    return await SwishjamAPI.Users.list({ limit: 5 }).then(({ users }) =>
      setNewUsersData(users),
    );
  };

  const getOrganizationsData = async () => {
    return await SwishjamAPI.Organizations.list({ limit: 5 }).then(
      ({ organizations }) => setNewOrganizationsData(organizations),
    );
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
      <div className="grid grid-cols-2 mt-8 flex items-center">
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Timefilter selection={timeframeFilter} onSelection={setTimeframeFilter} />
          <Button
            variant="outline"
            className={`ml-4 bg-white ${isRefreshing ? "cursor-not-allowed" : ""}`}
            onClick={() => getAllData(timeframeFilter)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
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
      <div className="grid grid-cols-3 gap-4 pt-2">
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
        <RetentionWidgetTiny
          retentionCohorts={userRetentionData}
          isExpandable={false}
        />
      </div>
      <div className="pt-8 flex justify-between">
        <h3 className="font-semibold text-sm text-slate-600">
          Key SaaS Metrics
        </h3>
        <Link href="#" className="group opacity-50">
          <h3 className="font-semibold text-sm text-slate-600 group-hover:text-swishjam transition-all duration-500">
            Deep Dive Report <BsArrowRightShort size={24} className="inline" />
          </h3>
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-2">
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
      <div className="grid grid-cols-3 gap-4 pt-2">
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
      <h3 className="pt-8 font-semibold text-sm text-slate-600">
        New Users & Organizations
      </h3>
      <div className="grid grid-cols-2 gap-4 pt-8">
        <ItemizedList
          fallbackAvatarGenerator={(user) => {
            return user?.initials?.slice(0, 2) || "";
          }}
          items={newUsersData}
          titleFormatter={(user) =>
            user.full_name || user.email || user.user_unique_identifier
          }
          subTitleFormatter={(user) => (user.full_name ? user.email : null)}
          linkFormatter={(user) => `/users/${user.id}`}
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
          title="New Users"
          viewMoreUrl="/users"
          maxNumItems={5}
        />
        <ItemizedList
          fallbackAvatarGenerator={(org) => {
            return org?.initials?.slice(0, 2) || "";
          }}
          items={newOrganizationsData}
          titleFormatter={(org) =>
            org.name || org.organization_unique_identifier
          }
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
