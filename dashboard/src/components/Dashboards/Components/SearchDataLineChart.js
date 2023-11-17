"use client"

import { useEffect, useState } from 'react';
// import { LineChart, Tooltip, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart } from 'recharts';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon, Cog8ToothIcon } from "@heroicons/react/24/outline";
import { CircleIcon } from "@radix-ui/react-icons"
import { BsCloudSlash } from "react-icons/bs"
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';

const LoadingState = ({ title, includeCard = true }) => (
  includeCard ? (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-[100px] h-[30px] rounded-sm" />
        <Skeleton className="w-full h-20 rounded-sm mt-1" />
      </CardContent>
    </Card>
  ) : (
    <>
      <CardTitle className="text-sm font-medium cursor-default pb-4">{title}</CardTitle>
      <Skeleton className="w-[100px] h-[30px] rounded-sm" />
      <Skeleton className="w-full h-20 rounded-sm mt-1" />
    </>
  )
)

const CustomTooltip = ({ active, payload, valueFormatter, dateFormatter, onDisplay = () => { } }) => {
  useEffect(() => {
    if (active) {
      onDisplay(payload[0]?.payload)
    }
  }, [active, payload])

  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CircleIcon className="mr-1 h-3 w-3 fill-swishjam text-swishjam" />
              {valueFormatter(data.value)} - {dateFormatter(data.date)}
            </div>
          </div>
          {data.comparisonValue >= 0 &&
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CircleIcon className="mr-1 h-3 w-3 fill-slate-200 text-slate-200" />
                {valueFormatter(data.comparisonValue)} - {dateFormatter(data.comparisonDate)}
              </div>
            </div>
          }
        </CardContent>
      </Card>
    );
  }
  return null;
}

const dateFormatter = dateFormatterForGrouping('day');

export default function SearchDataLineChart({
  includeCard = true,
  noDataMessage = 'No search data available.',
  timeseries,
  title = 'Google Search Console data',
  valueFormatter = val => val,
  className,
}) {
  if ([null, undefined].includes(timeseries)) return <LoadingState title={title} includeCard={includeCard} />;

  console.log(timeseries);

  return (
    <ConditionalCardWrapper
      className={`${className} group`}
      includeCard={includeCard}
      title={title}
    >
      <div className="">
        <div className="text-2xl font-bold cursor-default flex">
        </div>
        <div className=''>
        </div>
      </div>
      {timeseries.length > 0
        ? (
          <div className='flex align-center justify-center mt-6'>
            <ResponsiveContainer width="100%" aspect={3}>
              <AreaChart data={timeseries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  includeHidden
                  minTickGap={10}
                  interval='preserveStartEnd'
                  axisLine={false}
                  tickLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  padding={{ left: 0, right: 0 }}
                  height={20}
                />
                <YAxis
                  width={30}
                  dataKey="value"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={valueFormatter}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />
                <Tooltip
                  animationBegin={200}
                  animationDuration={400}
                  wrapperStyle={{ outline: "none" }}
                  // content={<CustomTooltip valueFormatter={valueFormatter} dateFormatter={dateFormatter} />}
                  allowEscapeViewBox={{ x: false, y: true }}
                  animationEasing='ease-in-out'
                />
                <Area
                  type="monotone"
                  dataKey='ctr'
                  stroke="#7dd3fc"
                  dot={{ r: 0 }}
                  activeDot={{ r: 2 }}
                  strokeWidth={2}
                  fill="#F2FAFE"
                />
                <Area
                  type="monotone"
                  dataKey='clicks'
                  stroke="#FFBB78"
                  dot={{ r: 0 }}
                  activeDot={{ r: 2 }}
                  strokeWidth={2}
                  fill="#F2FAFE"
                />
                <Area
                  type="monotone"
                  dataKey='impressions'
                  stroke="#C5B0D5"
                  dot={{ r: 0 }}
                  activeDot={{ r: 2 }}
                  strokeWidth={2}
                  fill="#F2FAFE"
                />
                <Area
                  type="monotone"
                  dataKey='position'
                  stroke="#DBDB8D"
                  dot={{ r: 0 }}
                  activeDot={{ r: 2 }}
                  strokeWidth={2}
                  fill="#F2FAFE"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 mt-6">
            <BsCloudSlash size={24} className='text-gray-500 mr-2' />
            <span className="text-sm text-gray-500">{noDataMessage}</span>
          </div>
        )
      }
    </ConditionalCardWrapper>
  )
}