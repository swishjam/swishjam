'use client'

import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import LineChartWithValue from "@/components/DashboardComponents/LineChartWithValue";
import ItemizedList from "@/components/DashboardComponents/ItemizedList";
import BarListCard from "@/components/DashboardComponents/BarListCard";

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

      setTopUsers(
        top_users.map(({ is_anonymous, id, email, full_name, device_identifier, count }) => {
          if (is_anonymous) {
            return { full_name: 'Anonymous User', count }
          } else {
            return { id, email, full_name, device_identifier, count }
          }
        })
      );
      setTopEventAttributes(
        top_attributes.map(({ attribute, count }) => ({ name: attribute, value: count }))
      );

    })
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
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
        />
      </div>
      <div className='mt-8 grid grid-cols-2 gap-x-4'>
        <BarListCard title='Top Attributes' items={topEventAttributes} />
        <ItemizedList
          title='Top Users'
          subTitle={<>By occurrences of <span className='italic'>{name}</span></>}
          items={topUsers}
          leftItemHeaderKey='full_name'
          leftItemSubHeaderKey='email'
          rightItemKey='count'
          linkFormatter={u => `/users/${u.id}`}
        />
      </div>
    </main>
  )
}