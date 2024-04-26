'use client'

import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import LineChartWithValue from "@/components/Dashboards/Components/AreaChartWithValue";
import ItemizedList from "@/components/Dashboards/Components/ItemizedList";
import BarList from "@/components/Dashboards/Components/BarList";

export default function EventDetails({ params }) {
  const { name: encodedName } = params;
  const name = decodeURIComponent(encodedName);

  const [eventTimeseries, setEventTimeseries] = useState();
  const [topEventAttributes, setTopEventAttributes] = useState();
  const [topUsers, setTopUsers] = useState();

  useEffect(() => {
    SwishjamAPI.Events.retrieve(name).then(({
      timeseries,
      comparison_timeseries,
      current_count,
      comparison_count,
      comparison_end_time,
      grouped_by,
      top_users,
      top_attributes
    }) => {
      setEventTimeseries({
        value: current_count,
        previousValue: comparison_count,
        previousValueDate: comparison_end_time,
        // valueChange: paymentData.change_in_mrr,
        groupedBy: grouped_by,
        timeseries: timeseries.map((timeseries, index) => ({
          ...timeseries,
          comparisonDate: comparison_timeseries[index]?.date,
          comparisonValue: comparison_timeseries[index]?.value
        })),
      })

      setTopUsers(top_users);
      setTopEventAttributes(
        top_attributes.map(({ attribute, count }) => ({ name: attribute, value: count }))
      );

    })
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">{name}</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <div className='mt-8'>
        <LineChartWithValue
          title='Occurrences'
          value={eventTimeseries?.value}
          previousValue={eventTimeseries?.previousValue}
          previousValueDate={eventTimeseries?.previousValueDate}
          timeseries={eventTimeseries?.timeseries}
          groupedBy={eventTimeseries?.groupedBy}
          showAxis={true}
        />
      </div>
      <div className='mt-8 grid grid-cols-2 gap-x-4'>
        <BarList title='Top Attributes' items={topEventAttributes} />
        <ItemizedList
          title='Top Users'
          subTitle={<>By occurrences of <span className='italic'>{name}</span></>}
          items={topUsers}
          titleFormatter={u => {
            if (u.metadata) {
              const metadata = JSON.parse(u.metadata);
              const firstName = metadata.first_name || metadata.firstName;
              if (firstName) {
                const lastName = metadata.last_name || metadata.lastName;
                return `${firstName} ${lastName}`;
              }
            }
            return u.email || `Anonymous User ${u.user_profile_id.slice(0, 8)}`;
          }}
          leftItemSubHeaderKey='email'
          rightItemKey='count'
          linkFormatter={u => `/users/${u.user_profile_id}`}
        />
      </div>
    </main>
  )
}