"use client";

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import LineChartWithValue from "@/components/DashboardComponents/LineChartWithValue";
import ClickableValueCard from "@/components/DashboardComponents/ClickableValueCard";
import BarListCard from "@/components/DashboardComponents/BarListCard";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
// import LoadingView from './LoadingView'

const sessionsFormatter = (num) => num.toLocaleString("en-US");

export default function PageMetrics() {
  const [currentSelectedChart, setCurrentSelectedChart] = useState("Sessions");
  const [dataSourceToFilterOn, setDataSourceToFilterOn] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageViewsChart, setPageViewsChart] = useState();
  const [sessionsChart, setSessionsChart] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");
  const [topReferrers, setTopReferrers] = useState();
  const [topBrowsers, setTopBrowsers] = useState();
  const [topDevices, setTopDevices] = useState();
  const [topPages, setTopPages] = useState();
  const [uniqueVisitorsChart, setUniqueVisitorsChart] = useState();

  const currentChartLookup = {
    Sessions: sessionsChart,
    "Unique Visitors": uniqueVisitorsChart,
    "Page Views": pageViewsChart,
  };

  const getSessionData = async (dataSource, timeframe) => {
    return await SwishjamAPI.Sessions.timeseries({ timeframe, dataSource }).then(
      ({ current_count, comparison_count, comparison_end_time, timeseries, comparison_timeseries, grouped_by }) => {
        setSessionsChart({
          value: current_count,
          previousValue: comparison_count,
          previousValueDate: comparison_end_time,
          valueChange: current_count - comparison_count,
          timeseries: timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
          valueFormatter: sessionsFormatter,
          dateFormatter: dateFormatterForGrouping(grouped_by)
        });
      });
  };

  const getReferrerData = async (dataSource, timeframe) => {
    return await SwishjamAPI.Sessions.Referrers.list({ timeframe, dataSource }).then(({ referrers }) => {
      setTopReferrers(
        referrers.map(({ referrer, count }) => ({
          name: [null, undefined, ""].includes(referrer) ? "Direct" : referrer,
          value: count,
        }))
      );
    });
  };

  const getDemographicData = async (dataSource, timeframe) => {
    return await SwishjamAPI.Sessions.demographics({ timeframe, dataSource }).then(demographics => {
      setTopBrowsers(
        demographics.browsers.map(({ browser_name, count }) => ({ name: browser_name, value: count }))
      );
      setTopDevices(
        demographics.device_types.map(({ device_type, count }) => ({ name: device_type, value: count }))
      );
      // setTopCountries(Object.keys(demographics.countries).map(country => ({ name: country, value: demographics.countries[country] })));
    });
  };

  const getPageViewsTimeseries = async (dataSource, timeframe) => {
    return await SwishjamAPI.PageViews.timeseries({ timeframe, dataSource }).then(
      ({ current_count, comparison_count, comparison_end_time, timeseries, comparison_timeseries, grouped_by }) => {
        setPageViewsChart({
          value: current_count,
          previousValue: comparison_count,
          previousValueDate: comparison_end_time,
          valueChange: current_count - comparison_count,
          timeseries: timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
          valueFormatter: sessionsFormatter,
          dateFormatter: dateFormatterForGrouping(grouped_by)
        });
      });
  };

  const getUniqueVisitors = async (dataSource, timeframe) => {
    return await SwishjamAPI.Users.Active.timeseries({ timeframe, dataSource, type: 'daily', includeComparison: true }).then(
      ({ current_value, timeseries, comparison_value, comparison_timeseries, comparison_end_time, grouped_by }) => {
        setUniqueVisitorsChart({
          value: current_value || 0,
          previousValue: comparison_value || 0,
          previousValueDate: comparison_end_time,
          valueChange: (current_value || 0) - (comparison_value || 0),
          timeseries: timeseries?.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
          dateFormatter: dateFormatterForGrouping(grouped_by)
        });
      }
    );
  };

  const getTopPages = async (dataSource, timeframe) => {
    return await SwishjamAPI.PageViews.list({ timeframe, dataSource }).then(({ page_view_counts }) => {
      setTopPages(
        page_view_counts.map(({ url, count }) => ({ name: url, value: count }))
      )
    });
  };

  const getAllData = async (dataSource, timeframe) => {
    // Reset All Data
    setIsRefreshing(true);
    setSessionsChart();
    setPageViewsChart();
    setUniqueVisitorsChart();
    setTopReferrers();
    setTopPages();
    setTopDevices();
    setTopBrowsers();

    // Reload all the data
    await Promise.all([
      getSessionData(dataSource, timeframe),
      getPageViewsTimeseries(dataSource, timeframe),
      getUniqueVisitors(dataSource, timeframe),
      getTopPages(dataSource, timeframe),
      getDemographicData(dataSource, timeframe),
      getReferrerData(dataSource, timeframe),
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    SwishjamAPI.Config.retrieve().then(({ settings }) => {
      const dataSource = settings.use_product_data_source_in_lieu_of_marketing ? 'product' : 'marketing';
      setDataSourceToFilterOn(dataSource);
      getAllData(dataSource, timeframeFilter);
    })
  }, []);

  return (
    <main className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flex grid grid-cols-2 items-center">
        <div>
          <h1 className="mb-0 text-lg font-medium text-gray-700">
            Marketing Site Metrics
          </h1>
        </div>

        <div className="flex w-full items-center justify-end">
          <Timefilter
            selection={timeframeFilter}
            onSelection={date => {
              setTimeframeFilter(date);
              getAllData(dataSourceToFilterOn, date);
            }}
          />
          <Button
            variant="outline"
            className={`ml-4 bg-white ${isRefreshing ? "cursor-not-allowed" : ""}`}
            onClick={() => getAllData(dataSourceToFilterOn, timeframeFilter)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6 pt-8">
        <div className="grid gap-6">
          <ClickableValueCard
            title="Sessions"
            selected={currentSelectedChart == "Sessions"}
            value={sessionsChart?.value}
            previousValue={sessionsChart?.previousValue}
            previousValueDate={sessionsChart?.previousValueDate}
            timeseries={sessionsChart?.timeseries}
            valueFormatter={(numSubs) => numSubs.toLocaleString("en-US")}
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
            value={sessionsChart?.value}
            previousValue={sessionsChart?.previousValue}
            previousValueDate={sessionsChart?.previousValueDate}
            timeseries={sessionsChart?.timeseries}
            valueFormatter={(numSubs) => numSubs.toLocaleString("en-US")}
            onClick={() => setCurrentSelectedChart("Page Views")}
          />
        </div>
        <div className="col-span-3">
          <LineChartWithValue
            title={currentSelectedChart}
            value={currentChartLookup[currentSelectedChart]?.value}
            previousValue={currentChartLookup[currentSelectedChart]?.previousValue}
            previousValueDate={currentChartLookup[currentSelectedChart]?.previousValueDate}
            timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
            valueFormatter={currentChartLookup[currentSelectedChart]?.valueFormatter}
            dateFormatter={currentChartLookup[currentSelectedChart]?.dateFormatter}
            showAxis={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-8">
        <BarListCard title="Referrers" items={topReferrers} />
        <BarListCard title="Top Pages" items={topPages} />
      </div>
      <div className="grid grid-cols-2 gap-6 pt-8">
        <BarListCard title="Devices" items={topDevices} />
        <BarListCard title="Browsers" items={topBrowsers} />
        {/* <BarListCard title='Countries' items={topCountries} />  */}
      </div>
    </main>
  );
}
