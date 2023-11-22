"use client";

import { useState, useEffect } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { RxBarChart } from 'react-icons/rx'
import ActiveUsersLineChartWithValue from "@/components/Dashboards/Components/ActiveUsersLineChartWithValue";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import ItemizedList from '@/components/Dashboards/Components/ItemizedList';
import Link from 'next/link'
import RetentionWidget from '@/components/Dashboards/Components/RetentionWidget';
import { formatNumbers } from "@/lib/utils/numberHelpers";

export default function PageMetrics() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");
  const [uniqueVisitorsChartData, setUniqueVisitorsChartData] = useState();
  const [uniqueVisitorsGrouping, setUniqueVisitorsGrouping] = useState('weekly');
  const [sessionsChart, setSessionsChart] = useState();
  const [userRetentionData, setUserRetentionData] = useState();
  const [newOrganizationsData, setNewOrganizationsData] = useState();
  const [newUsersData, setNewUsersData] = useState();

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

  const getSessionsData = async timeframe => {
    return await SwishjamAPI.Sessions.timeseries({ dataSource: 'product', timeframe }).then((sessionData) => {
      setSessionsChart({
        value: sessionData.current_count,
        previousValue: sessionData.comparison_count,
        previousValueDate: sessionData.comparison_end_time,
        valueChange: sessionData.count - sessionData.comparison_count,
        groupedBy: sessionData.grouped_by,
        timeseries: sessionData.timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: sessionData.comparison_timeseries[index]?.date,
          comparisonValue: sessionData.comparison_timeseries[index]?.value
        }))
      })
    })
  }

  const getUserRetentionData = async () => {
    return await SwishjamAPI.RetentionCohorts.get({ numOfCohorts: 10 }).then(setUserRetentionData)
  }

  const getUsersData = async () => {
    return await SwishjamAPI.Users.list().then(({ users }) => setNewUsersData(users))
  }

  const getOrganizationsData = async () => {
    // return await SwishjamAPI.Organizations.list().then(({ organizations }) => setNewOrganizationsData(organizations));
  }

  const getAllData = async timeframe => {
    // Reset All Data
    setIsRefreshing(true);
    setUniqueVisitorsChartData();
    setSessionsChart();
    setNewUsersData();
    setNewOrganizationsData();
    setUserRetentionData();

    // Reload all the data
    await Promise.all([
      getUniqueVisitorsData(timeframe, uniqueVisitorsGrouping),
      getSessionsData(timeframe),
      getUserRetentionData(),
      getUsersData(),
      getOrganizationsData(),
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
      <div className='pt-8 flex justify-between'>
        <h3 className='font-semibold text-sm text-slate-600'>User Breakdown</h3>
      </div>
      <div className="grid grid-cols-6 gap-4 pt-8">
        <div className="col-span-3">
          <ActiveUsersLineChartWithValue
            data={uniqueVisitorsChartData}
            selectedGrouping={uniqueVisitorsGrouping}
            showAxis={true}
            onGroupingChange={group => {
              setUniqueVisitorsChartData();
              setUniqueVisitorsGrouping(group);
              getUniqueVisitorsData(timeframeFilter, group);
            }}
          />
        </div>
        <div className="col-span-3">
          <LineChartWithValue
            title='New Users'
            value={sessionsChart?.value}
            previousValue={sessionsChart?.previousValue}
            previousValueDate={sessionsChart?.previousValueDate}
            showAxis={true}
            timeseries={sessionsChart?.timeseries}
            valueFormatter={formatNumbers}
          />
        </div>
        <div className="col-span-6">
          <RetentionWidget retentionCohorts={userRetentionData} />
        </div>
        <div className="col-span-3">
          <ItemizedList
            fallbackAvatarGenerator={user => user.initials.slice(0, 2)}
            items={newUsersData}
            titleFormatter={user => user.full_name || user.email || user.user_unique_identifier}
            subTitleFormatter={user => user.full_name ? user.email : null}
            linkFormatter={user => `/users/${user.id}`}
            rightItemKey='created_at'
            rightItemKeyFormatter={date => {
              return new Date(date)
                .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                .replace(`, ${new Date(date).getFullYear()}`, '')
            }}
            title='Recently Identified Users'
            viewMoreUrl='/users'
            maxNumItems={5}
          />
        </div>
        <div className="col-span-3">
          {/*<ItemizedList
            fallbackAvatarGenerator={user => user.initials.slice(0,2)}
            items={newUsersData}
            titleFormatter={user => user.full_name || user.email || user.user_unique_identifier}
            subTitleFormatter={user => user.full_name ? user.email : null}
            linkFormatter={user => `/users/${user.id}`}
            rightItemKey='created_at'
            rightItemKeyFormatter={date => {
              return new Date(date)
                .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                .replace(`, ${new Date(date).getFullYear()}`, '')
            }}
            title='Recently Inactive (7 days)'
            viewMoreUrl='/users'
            maxNumItems={5}
          />*/}
        </div>
      </div>
      {/* <div className='pt-8 flex justify-between'>
        <h3 className='font-semibold text-sm text-slate-600'>Organization Breakdown (Coming Soon)</h3>
      </div>
      <div className="grid grid-cols-6 gap-4 pt-8">
      </div>
      <div className='pt-8 flex justify-between'>
        <h3 className='font-semibold text-sm text-slate-600'>Feature Breakdown (Coming Soon)</h3>
      </div> */}
    </main>
  );
}
