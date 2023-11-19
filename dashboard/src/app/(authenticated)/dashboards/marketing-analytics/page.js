"use client";

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import ClickableValueCard from "@/components/Dashboards/Components/ClickableValueCard";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { RxBarChart } from 'react-icons/rx'
import BarChart from "@/components/Dashboards/Components/BarChart";
import Link from 'next/link'
import {
  formatMoney,
  formatNumbers,
  formatShrinkNumbers,
  formatShrinkMoney
} from "@/lib/utils/numberHelpers";

//import BarList from "@/components/Dashboards/Components/BarList";
//import { BsArrowLeftShort } from 'react-icons/bs'
//import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
// import LoadingView from './LoadingView'


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
      SwishjamAPI.Sessions.Browsers.barChart({ timeframe }).then(({ data }) => setBrowsersBarChartData(data)),
      SwishjamAPI.Sessions.DeviceTypes.barChart({ timeframe }).then(({ data }) => setDeviceTypesBarChartData(data))
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

    // Reload all the data
    await Promise.all([
      getSessionTimeseriesData(timeframe),
      getPageViewsTimeseriesData(timeframe),
      getUniqueVisitorsTimeseries(timeframe),
      getPageViewsBarChartData(timeframe),
      getDemographicsBarChartData(timeframe),
      getSessionReferrersBarChartData(timeframe),
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
            Marketing Analytics 
          </h1>
        </div>

        <div className="flex w-full items-center justify-end">
          <Timefilter
            selection={timeframeFilter}
            onSelection={date => {
              setTimeframeFilter(date);
              getAllData(date);
            }}
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
      <div className="grid grid-cols-4 gap-4 pt-8">
        <div className="grid gap-4">
          <ClickableValueCard
            title="Sessions"
            selected={currentSelectedChart == "Sessions"}
            value={sessionsTimeseriesData?.value}
            previousValue={sessionsTimeseriesData?.previousValue}
            previousValueDate={sessionsTimeseriesData?.previousValueDate}
            timeseries={sessionsTimeseriesData?.timeseries}
            valueFormatter={formatNumbers}
            onClick={() => setCurrentSelectedChart("Sessions")}
          />
          <ClickableValueCard
            title="Unique Visitors"
            selected={currentSelectedChart === "Unique Visitors"}
            value={uniqueVisitorsChart?.value}
            previousValue={uniqueVisitorsChart?.previousValue}
            previousValueDate={uniqueVisitorsChart?.previousValueDate}
            timeseries={uniqueVisitorsChart?.timeseries}
            valueFormatter={(numSubs) => numSubs.toLocaleString("en-US")}
            onClick={() => setCurrentSelectedChart("Unique Visitors")}
          />
          <ClickableValueCard
            title="Page Views"
            selected={currentSelectedChart === "Page Views"}
            value={pageViewsTimeseriesData?.value}
            previousValue={pageViewsTimeseriesData?.previousValue}
            previousValueDate={pageViewsTimeseriesData?.previousValueDate}
            timeseries={pageViewsTimeseriesData?.timeseries}
            valueFormatter={numPageViews => numPageViews.toLocaleString("en-US")}
            onClick={() => setCurrentSelectedChart("Page Views")}
          />
        </div>
        <div className="col-span-3">
          <LineChartWithValue
            groupedBy={currentChartLookup[currentSelectedChart]?.groupedBy}
            previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
            previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
            showAxis={true}
            timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
            title={currentSelectedChart}
            value={currentChartLookup[currentSelectedChart]?.value}
            valueFormatter={currentChartLookup[currentSelectedChart]?.valueFormatter}
          />
        </div>
      </div>

      <div className='grid grid-cols-8 gap-4 pt-4'>
        <BarChart
          title='Page Views'
          className="col-span-8"
          data={pageViewsBarChartData}
          showTableInsteadOfLegend={true}
        />
      </div>
      <div className='grid grid-cols-8 gap-4 pt-4'>
        <BarChart 
          title='Referrers'
          className="col-span-8"
          data={referrersBarChartData}
          showTableInsteadOfLegend={true}
         />
      </div>
      <div className='grid grid-cols-2 gap-4 pt-4'>
        <BarChart title='Devices' data={deviceTypesBarChartData} />
        <BarChart title='Browsers' data={browsersBarChartData} />
      </div>
    </main>
  );
}
