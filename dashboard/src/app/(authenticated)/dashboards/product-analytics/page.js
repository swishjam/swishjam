"use client";

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { RxBarChart } from 'react-icons/rx'
import ActiveUsersLineChartWithValue from "@/components/Dashboards/Components/ActiveUsersLineChartWithValue";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
import BarChart from "@/components/Dashboards/Components/BarChart";
import { BsArrowLeftShort } from 'react-icons/bs'
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import ClickableValueCard from "@/components/Dashboards/Components/ClickableValueCard";
import BarList from "@/components/Dashboards/Components/BarList";
import Link from 'next/link'
// import LoadingView from './LoadingView'

export default function PageMetrics() {
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");
  const [uniqueVisitorsChartData, setUniqueVisitorsChartData] = useState();
  const [uniqueVisitorsGrouping, setUniqueVisitorsGrouping] = useState('weekly');

  const getUniqueVisitorsData = async (timeframe, type) => {
    return await SwishjamAPI.Users.Active.timeseries({ timeframe, dataSource: 'product', type, include_comparison: true }).then(
      ({ current_value, timeseries, comparison_value, comparison_timeseries, comparison_end_time, grouped_by }) => {
        setUniqueVisitorsChartData({
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
      }
    );
  };

  const getAllData = async timeframe => {
    // Reset All Data
    setIsRefreshing(true);
    setUniqueVisitorsChartData();

    // Reload all the data
    await Promise.all([
      getUniqueVisitorsData(timeframe, uniqueVisitorsGrouping)
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
            Product Analytics 
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
      <div className='grid grid-cols-3 gap-4 pt-4'>
        <ActiveUsersLineChartWithValue
          data={uniqueVisitorsChartData}
          selectedGrouping={uniqueVisitorsGrouping}
          showAxis={false}
          onGroupingChange={group => {
            setUniqueVisitorsChartData();
            setUniqueVisitorsGrouping(group);
            getUniqueVisitorsData(timeframeFilter, group);
          }}
        />
      </div> 
      <div className="grid grid-cols-4 gap-4 pt-8">
        <div className="grid gap-4">
        </div>
        <div className="col-span-3">
        </div>
      </div>
    </main>
  );
}
