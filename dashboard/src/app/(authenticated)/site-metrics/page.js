"use client";

import { useState, useEffect } from "react";
import { API } from "@/lib/api-client/base";
import LineChartWithValue from "@/components/DashboardComponents/LineChartWithValue";
import ClickableValueCard from "@/components/DashboardComponents/ClickableValueCard";
import BarListCard from "@/components/DashboardComponents/BarListCard";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
// import LoadingView from './LoadingView'

const sessionsFormatter = (num) => num.toLocaleString("en-US");

export default function PageMetrics() {
  const [sessionsChart, setSessionsChart] = useState();
  const [uniqueVisitorsChart, setUniqueVisitorsChart] = useState();
  const [pageViewsChart, setPageViewsChart] = useState();
  const [topReferrers, setTopReferrers] = useState();
  const [topPages, setTopPages] = useState();
  const [topDevices, setTopDevices] = useState();
  const [topBrowsers, setTopBrowsers] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSelectedChart, setCurrentSelectedChart] = useState("Sessions");

  const currentChartLookup = {
    Sessions: sessionsChart,
    "Unique Visitors": uniqueVisitorsChart,
    "Page Views": pageViewsChart,
  };

  const getSessionData = async (timeframe) => {
    await API.get("/api/v1/sessions/timeseries", {
      timeframe,
      data_source: "marketing",
    }).then((sessionData) => {
      setSessionsChart({
        value: sessionData?.current_count,
        previousValue: sessionData?.comparison_count,
        previousValueDate: sessionData?.comparison_end_time,
        valueChange: sessionData?.current_count - sessionData?.comparison_count,
        timeseries: sessionData?.timeseries.map((timeseries, index) => ({
          ...timeseries,
          index,
          comparisonDate: sessionData?.comparison_timeseries[index]?.date,
          comparisonValue: sessionData?.comparison_timeseries[index]?.value,
        })),
        valueFormatter: sessionsFormatter,
      });
    });
  };

  const getReferrerData = async (timeframe) => {
    await API.get("/api/v1/sessions/referrers", {
      timeframe,
      data_source: "marketing",
    }).then(({ referrers }) => {
      setTopReferrers(
        referrers.map(({ referrer, count }) => ({
          name: [null, undefined, ""].includes(referrer) ? "Direct" : referrer,
          value: count,
        }))
      );
    });
  };

  const getDemographicData = async (timeframe) => {
    await API.get("/api/v1/sessions/demographics", {
      timeframe,
      data_source: "marketing",
    }).then((demographics) => {
      setTopBrowsers(
        demographics.browsers.map(({ browser_name, count }) => ({
          name: browser_name,
          value: count,
        }))
      );
      setTopDevices(
        demographics.device_types.map(({ device_type, count }) => ({
          name: device_type,
          value: count,
        }))
      );
      // setTopCountries(Object.keys(demographics.countries).map(country => ({ name: country, value: demographics.countries[country] })));
    });
  };

  const getPageViewsTimeseries = async (timeframe) => {
    await API.get("/api/v1/page_views/timeseries", {
      timeframe,
      data_source: "marketing",
    }).then((pageViewData) => {
      setPageViewsChart({
        value: pageViewData?.current_count,
        previousValue: pageViewData?.comparison_count,
        previousValueDate: pageViewData?.comparison_end_time,
        valueChange:
          pageViewData?.current_count - pageViewData?.comparison_count,
        timeseries: pageViewData?.timeseries.map((timeseries, index) => ({
          ...timeseries,
          index,
          comparisonDate: pageViewData?.comparison_timeseries[index]?.date,
          comparisonValue: pageViewData?.comparison_timeseries[index]?.value,
        })),
        valueFormatter: sessionsFormatter,
      });
    });
  };

  const getUniqueVisitors = async (timeframe = "30_days") => {
    await API.get("/api/v1/users/active", {
      timeframe,
      data_source: "marketing",
      type: "daily",
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
          dateFormatter: (date) => {
            if (grouped_by === "month") {
              return new Date(date).toLocaleString("default", {
                month: "long",
              });
            } else if (grouped_by === "week") {
              return `Week of ${new Date(date).toLocaleString("default", {
                month: "short",
                day: "numeric",
              })}`;
            } else if (grouped_by === "day") {
              return new Date(date).toLocaleString("default", {
                month: "short",
                day: "numeric",
              });
            } else {
              return date;
            }
          },
        });
      }
    );
  };

  const getTopPages = async (timeframe) => {
    await API.get("/api/v1/page_views/", {
      timeframe,
      data_source: "marketing",
    }).then(({ page_view_counts }) => {
      setTopPages(
        page_view_counts.map(({ url, count }) => ({ name: url, value: count }))
      );
    });
  };

  const getAllData = async (timeframe) => {
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
            Marketing Site Metrics
          </h1>
        </div>

        <div className="flex w-full items-center justify-end">
          <Timefilter
            selection={timeframeFilter}
            onSelection={(d) => {
              setTimeframeFilter(d);
              getAllData(d);
            }}
          />
          <Button
            variant="outline"
            className={`ml-4 bg-white ${
              isRefreshing ? "cursor-not-allowed" : ""
            }`}
            onClick={() => getAllData(timeframeFilter)}
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
            previousValue={
              currentChartLookup[currentSelectedChart]?.previousValue
            }
            previousValueDate={
              currentChartLookup[currentSelectedChart]?.previousValueDate
            }
            timeseries={currentChartLookup[currentSelectedChart]?.timeseries}
            valueFormatter={
              currentChartLookup[currentSelectedChart]?.valueFormatter
            }
            dateFormatter={(date) =>
              (currentChartLookup[currentSelectedChart]?.dateFormatter &&
                currentChartLookup[currentSelectedChart]?.dateFormatter(
                  date
                )) ||
              new Date(date).toLocaleDateString("en-us", {
                month: "2-digit",
                day: "2-digit",
              })
            }
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
