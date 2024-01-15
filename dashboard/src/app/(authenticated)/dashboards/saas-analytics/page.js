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
import RetentionWidget from '@/components/Dashboards/Components/RetentionWidget';

export default function PageMetrics() {
  const [browsersBarChartData, setBrowsersBarChartData] = useState();
  const [currentSelectedChart, setCurrentSelectedChart] = useState("Sessions");
  const [deviceTypesBarChartData, setDeviceTypesBarChartData] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageViewsTimeseriesData, setPageViewsTimeseriesData] = useState();
  const [sessionsTimeseriesData, setSessionsTimeseriesData] = useState();
  const [referrersBarChartData, setReferrersBarChartData] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");
  const [pageViewsBarChartData, setPageViewsBarChartData] = useState();
  const [uniqueVisitorsChart, setUniqueVisitorsChart] = useState();
  const [utmMediumsBarChartData, setUtmMediumsBarChartData] = useState();
  const [utmSourcesBarChartData, setUtmSourcesBarChartData] = useState();
  const [utmTermsBarChartData, setUtmTermsBarChartData] = useState();
  const [utmContentsBarChartData, setUtmContentsBarChartData] = useState();
  const [utmCampaignsBarChartData, setUtmCampaignsBarChartData] = useState();

  const currentChartLookup = {
    Sessions: sessionsTimeseriesData,
    "Unique Visitors": uniqueVisitorsChart,
    "Page Views": pageViewsTimeseriesData,
  };

  const getSessionTimeseriesData = async timeframe => {
    return await SwishjamAPI.Sessions.timeseries({ timeframe, dataSource: 'marketing' }).then(
      ({ current_count, comparison_count, comparison_end_time, timeseries, comparison_timeseries, grouped_by }) => {
        setSessionsTimeseriesData({
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
      });
  };

  const getSessionReferrersBarChartData = async timeframe => {
    await SwishjamAPI.Sessions.Referrers.barChart({ timeframe }).then(({ data }) => {
      const formattedReferrerData = data.map(referrerData => {
        if (referrerData['']) {
          referrerData['Direct'] = referrerData[''];
          delete referrerData[''];
        }
        return referrerData;
      })
      setReferrersBarChartData(formattedReferrerData)
    });
  };

  const getDemographicsBarChartData = async timeframe => {
    return await Promise.all([
      SwishjamAPI.Sessions.Browsers.barChart({ timeframe, dataSource: 'marketing' }).then(({ data }) => setBrowsersBarChartData(data)),
      SwishjamAPI.Sessions.DeviceTypes.barChart({ timeframe, dataSource: 'marketing' }).then(({ data }) => setDeviceTypesBarChartData(data))
    ])
  };

  const getPageViewsTimeseriesData = async timeframe => {
    return await SwishjamAPI.PageViews.timeseries({ timeframe, dataSource: 'marketing' }).then(
      ({ current_count, comparison_count, comparison_end_time, timeseries, comparison_timeseries, grouped_by }) => {
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
      });
  };

  const getUniqueVisitorsTimeseries = async timeframe => {
    return await SwishjamAPI.Users.Active.timeseries({ timeframe, dataSource: 'marketing', type: 'daily', includeComparison: true }).then(
      ({ current_value, timeseries, comparison_value, comparison_timeseries, comparison_end_time, grouped_by }) => {
        setUniqueVisitorsChart({
          groupedBy: grouped_by,
          previousValue: comparison_value || 0,
          previousValueDate: comparison_end_time,
          timeseries: timeseries?.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
          value: current_value || 0,
          valueChange: (current_value || 0) - (comparison_value || 0),
        });
      }
    );
  };

  const getPageViewsBarChartData = async timeframe => {
    await SwishjamAPI.PageViews.barChart({ timeframe, dataSource: 'marketing' }).then(({ data }) => setPageViewsBarChartData(data));
  };

  const getUtmBarChartData = async timeframe => {
    await SwishjamAPI.Sessions.UrlParameters.barChart({ queryParams: ['utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content'], timeframe }).then(
      ({ utm_source, utm_campaign, utm_medium, utm_term, utm_content }) => {
        setUtmSourcesBarChartData(utm_source);
        setUtmCampaignsBarChartData(utm_campaign);
        setUtmMediumsBarChartData(utm_medium);
        setUtmTermsBarChartData(utm_term);
        setUtmContentsBarChartData(utm_content);
      });
  };

  const getAllData = async timeframe => {
    // Reset All Data
    setIsRefreshing(true);
    setSessionsTimeseriesData();
    setPageViewsTimeseriesData();
    setUniqueVisitorsChart();
    setReferrersBarChartData();
    setPageViewsBarChartData();
    setDeviceTypesBarChartData();
    setBrowsersBarChartData();
    setUtmCampaignsBarChartData();
    setUtmMediumsBarChartData();
    setUtmSourcesBarChartData();
    setUtmTermsBarChartData();
    setUtmContentsBarChartData();

    // Reload all the data
    await Promise.all([
      getSessionTimeseriesData(timeframe),
      getPageViewsTimeseriesData(timeframe),
      getUniqueVisitorsTimeseries(timeframe),
      getPageViewsBarChartData(timeframe),
      getDemographicsBarChartData(timeframe),
      getSessionReferrersBarChartData(timeframe),
      getUtmBarChartData(timeframe),
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
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'Current MRR'}
          value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'Active Subscriptions'}
          value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'Active Customers'}
          value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
      </div>
      <div className='grid grid-cols-8 gap-2 pt-2'>
        <div className="col-span-4">
          <RetentionWidget
            title="Revenue Retention" 
            retentionCohorts={{}}
          />
        </div>
        <div className="col-span-4">
          <RetentionWidget
            title="Customer Retention"
            retentionCohorts={{}}
          />
        </div>
      </div>

      <div className='grid grid-cols-4 gap-2 pt-2'>
        <LineChartWithValue
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'Avg. Revenue/Customer'}
          value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'New Customers'}
          value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'New Trials'}
          value={currentChartLookup[currentSelectedChart]?.value}
          valueFormatter={formatNumbers}
          yAxisFormatter={formatShrinkNumbers}
        />
        <LineChartWithValue
          groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
          previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
          previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
          showAxis={false}
          timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
          title={'Customer Churn'}
          value={currentChartLookup[currentSelectedChart]?.value}
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

    </main>
  );
}
