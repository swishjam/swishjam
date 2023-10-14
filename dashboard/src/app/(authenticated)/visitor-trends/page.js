"use client";

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import ClickableValueCard from "@/components/Dashboards/Components/ClickableValueCard";
import BarList from "@/components/Dashboards/Components/BarList";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
// import LoadingView from './LoadingView'

const sessionsFormatter = (num) => num.toLocaleString("en-US");

export default function PageMetrics() {
  const [currentSelectedChart, setCurrentSelectedChart] = useState("Sessions");
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

  const getSessionData = async timeframe => {
    return await SwishjamAPI.Sessions.timeseries({ timeframe, dataSource: 'marketing' }).then(
      ({ current_count, comparison_count, comparison_end_time, timeseries, comparison_timeseries, grouped_by }) => {
        setSessionsChart({
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
          valueFormatter: sessionsFormatter,
        });
      });
  };

  const getReferrerData = async timeframe => {
    return await SwishjamAPI.Sessions.Referrers.list({ timeframe, dataSource: 'marketing' }).then(({ referrers }) => {
      setTopReferrers(
        referrers.map(({ referrer, count }) => ({
          name: [null, undefined, ""].includes(referrer) ? "Direct" : referrer,
          value: count,
        }))
      );
    });
  };

  const getDemographicData = async timeframe => {
    return await SwishjamAPI.Sessions.demographics({ timeframe, dataSource: 'marketing' }).then(demographics => {
      setTopBrowsers(
        demographics.browsers.map(({ browser_name, count }) => ({ name: browser_name, value: count }))
      );
      setTopDevices(
        demographics.device_types.map(({ device_type, count }) => ({ name: device_type, value: count }))
      );
      // setTopCountries(Object.keys(demographics.countries).map(country => ({ name: country, value: demographics.countries[country] })));
    });
  };

  const getPageViewsTimeseries = async timeframe => {
    return await SwishjamAPI.PageViews.timeseries({ timeframe, dataSource: 'marketing' }).then(
      ({ current_count, comparison_count, comparison_end_time, timeseries, comparison_timeseries, grouped_by }) => {
        setPageViewsChart({
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
          valueFormatter: sessionsFormatter,
        });
      });
  };

  const getUniqueVisitors = async timeframe => {
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

  const getTopPages = async timeframe => {
    return await SwishjamAPI.PageViews.list({ timeframe, dataSource: 'marketing' }).then(({ page_view_counts }) => {
      setTopPages(
        page_view_counts.map(({ url, count }) => ({ name: url, value: count }))
      )
    });
  };

  const getAllData = async timeframe => {
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
      getSessionData(timeframe),
      getPageViewsTimeseries(timeframe),
      getUniqueVisitors(timeframe),
      getTopPages(timeframe),
      getDemographicData(timeframe),
      getReferrerData(timeframe),
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
          <h1 className="mb-0 text-lg font-medium text-gray-700">
            Visitor Trends
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
            value={pageViewsChart?.value}
            previousValue={pageViewsChart?.previousValue}
            previousValueDate={pageViewsChart?.previousValueDate}
            timeseries={pageViewsChart?.timeseries}
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

      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarList title='Referrers' items={topReferrers} />
        <BarList title='Top Pages' items={topPages} />
      </div>
      <div className='grid grid-cols-2 gap-6 pt-8'>
        <BarList title='Devices' items={topDevices} />
        <BarList title='Browsers' items={topBrowsers} />
        {/* <BarList title='Countries' items={topCountries} />  */}
      </div>
    </main>
  );
}
