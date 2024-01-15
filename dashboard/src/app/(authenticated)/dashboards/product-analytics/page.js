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
  const [newUsersLineChartData, setNewUsersLineChartData] = useState();
  const [userRetentionData, setUserRetentionData] = useState();
  const [newOrganizationsData, setNewOrganizationsData] = useState();
  const [newUsersItemizedListData, setNewUsersItemizedListData] = useState();

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

  const getNewUsersLineChartData = async timeframe => {
    return await SwishjamAPI.Users.timeseries({ timeframe }).then(newUserData => {
      setNewUsersLineChartData({
        value: newUserData.current_count,
        previousValue: newUserData.comparison_count,
        previousValueDate: newUserData.comparison_end_time,
        valueChange: newUserData.count - newUserData.comparison_count,
        groupedBy: newUserData.grouped_by,
        timeseries: newUserData.timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: newUserData.comparison_timeseries[index]?.date,
          comparisonValue: newUserData.comparison_timeseries[index]?.value
        }))
      })
    })
  }

  const getUserRetentionData = async () => {
    return await SwishjamAPI.RetentionCohorts.get({ numCohorts: 10 }).then(setUserRetentionData)
  }

  const getNewUsersItemizedListData = async () => {
    return await SwishjamAPI.Users.list().then(({ users }) => setNewUsersItemizedListData(users))
  }

  const getOrganizationsData = async () => {
    // return await SwishjamAPI.Organizations.list().then(({ organizations }) => setNewOrganizationsData(organizations));
  }

  const getAllData = async timeframe => {
    // Reset All Data
    setIsRefreshing(true);
    setUniqueVisitorsChartData();
    setNewUsersLineChartData();
    setNewUsersItemizedListData();
    setNewOrganizationsData();
    setUserRetentionData();

    // Reload all the data
    await Promise.all([
      getUniqueVisitorsData(timeframe, uniqueVisitorsGrouping),
      getNewUsersLineChartData(timeframe),
      getUserRetentionData(),
      getNewUsersItemizedListData(),
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
      <div className='pt-8 flex justify-between'>
        <h3 className='font-semibold text-sm text-slate-600'>User Breakdown</h3>
      </div>
      <div className="grid grid-cols-6 gap-2 pt-2">
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
            value={newUsersLineChartData?.value}
            previousValue={newUsersLineChartData?.previousValue}
            previousValueDate={newUsersLineChartData?.previousValueDate}
            showAxis={true}
            timeseries={newUsersLineChartData?.timeseries}
            valueFormatter={formatNumbers}
          />
        </div>
        <div className="col-span-6">
          <RetentionWidget retentionCohorts={userRetentionData} />
        </div>
        <div className="col-span-3">
          <ItemizedList
            fallbackAvatarGenerator={user => user.initials?.slice(0, 2)}
            items={newUsersItemizedListData}
            titleFormatter={user => user.full_name || user.email || user.user_unique_identifier}
            subTitleFormatter={user => user.full_name ? user.email : null}
            linkFormatter={user => `/users/${user.swishjam_user_id}`}
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
            items={newUsersItemizedListData}
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
