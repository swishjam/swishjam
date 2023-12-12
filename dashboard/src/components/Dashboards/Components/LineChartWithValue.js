"use client"

import { useEffect, useState } from 'react';
// import { LineChart, Tooltip, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart } from 'recharts';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
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

const SettingsDropdown = ({ showXAxis, showYAxis, setShowXAxis, setShowYAxis, onSettingChange = () => { } }) => {
  const [open, setOpen] = useState()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="outline-0 ring-0">
        <Cog8ToothIcon className={`${open ? '!opacity-100' : ''} outline-0 ring-0 active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 duration-300 transition h-5 w-5 text-gray-500 cursor-pointer`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        <DropdownMenuItem
          className={`cursor-pointer ${showXAxis ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
          onClick={() => {
            const currentValueChangedFrom = showXAxis;
            const currentValueChangedTo = !showXAxis;
            setShowXAxis(currentValueChangedTo)
            onSettingChange({
              attribute: 'show-y-axis',
              currentValueWas: currentValueChangedFrom,
              currentValue: currentValueChangedTo
            })
          }}
        >
          {showXAxis && (
            <CheckCircleIcon className='h-4 w-4 absolute' />
          )}
          <span className='mx-6'>Show X-Axis</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`cursor-pointer ${showYAxis ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
          onClick={() => {
            const currentValueChangedFrom = showYAxis;
            const currentValueChangedTo = !showYAxis;
            setShowYAxis(currentValueChangedTo)
            onSettingChange({
              attribute: 'show-x-axis',
              currentValueWas: currentValueChangedFrom,
              currentValue: currentValueChangedTo
            })
          }}
        >
          {showYAxis && (
            <CheckCircleIcon className='h-4 w-4 absolute' />
          )}
          <span className='ml-6'>Show Y-Axis</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function LineChartWithValue({
  includeCard = true,
  includeComparisonData = true,
  includeSettingsDropdown = true,
  noDataMessage = (
    <div className="flex items-center justify-center">
      <BsCloudSlash size={24} className='text-gray-500 mr-2' />
      <span>No date available</span>
    </div>
  ),
  groupedBy,
  onSettingChange = () => { },
  showAxis = false,
  showTooltip = true,
  timeseries,
  title,
  valueFormatter = val => val,
  yAxisFormatter = val => val,
  className,
}) {
  if ([null, undefined].includes(timeseries)) return <LoadingState title={title} includeCard={includeCard} />;

  const [comparisonValue, setComparisonValue] = useState(timeseries[timeseries.length - 1]?.comparisonValue);
  const [comparisonValueDate, setComparisonValueDate] = useState(timeseries[timeseries.length - 1]?.comparisonDate);
  const [currentValue, setCurrentValue] = useState(timeseries[timeseries.length - 1]?.value);
  const [currentValueDate, setCurrentValueDate] = useState(timeseries[timeseries.length - 1]?.date);
  const [showXAxis, setShowXAxis] = useState(showAxis);
  const [showYAxis, setShowYAxis] = useState(showAxis);

  const dateFormatter = dateFormatterForGrouping(groupedBy)

  return (
    <ConditionalCardWrapper
      className={`${className} group`}
      includeCard={includeCard}
      title={
        <div className='grid grid-cols-2'>
          {title}
          <div className='flex justify-end'>
            {includeSettingsDropdown && (
              <SettingsDropdown
                showXAxis={showXAxis}
                showYAxis={showYAxis}
                setShowXAxis={setShowXAxis}
                setShowYAxis={setShowYAxis}
                onSettingChange={onSettingChange}
              />
            )}
          </div>
        </div>
      }
    >
      <div className="">
        <div className="text-2xl font-bold cursor-default flex">
          {typeof currentValue !== 'undefined' ? valueFormatter(currentValue) : ''}
          {includeComparisonData && typeof currentValue !== 'undefined' && typeof comparisonValue !== 'undefined' ? (
            <HoverCard>
              <HoverCardTrigger className='block w-fit ml-2 pt-2'>
                <p className="text-xs text-muted-foreground cursor-default">
                  {currentValue < comparisonValue ? <ArrowTrendingDownIcon className="h-4 w-4 inline-block text-red-500 mr-1" /> : <ArrowTrendingUpIcon className="h-4 w-4 inline-block text-green-500 mr-1" />}
                  <span className='underline decoration-dotted'>{valueFormatter(Math.abs(currentValue - comparisonValue))}</span>
                </p>
              </HoverCardTrigger>
              <HoverCardContent align={'center'} sideOffset={0} className='flex items-center text-gray-500'>
                <CalendarIcon className="h-6 w-6 inline-block mr-2" />
                <span className='text-xs'>There were {valueFormatter(comparisonValue)} {title} on {dateFormatter(comparisonValueDate)}.</span>
              </HoverCardContent>
            </HoverCard>
          ) : <></>}
        </div>
        <div className=''>
          <span className='text-xs font-light cursor-default block'>{currentValueDate ? dateFormatter(currentValueDate) : ''}</span>
        </div>
      </div>
      {timeseries.length > 0
        ? (
          <div
            onMouseLeave={() => {
              setCurrentValue(timeseries[timeseries.length - 1]?.value)
              setComparisonValue(timeseries[timeseries.length - 1]?.comparisonValue);
              setCurrentValueDate(timeseries[timeseries.length - 1]?.date);
              setComparisonValueDate(timeseries[timeseries.length - 1]?.comparisonDate);
            }}
            className='flex align-center justify-center mt-6'
          >
            <ResponsiveContainer width="100%" aspect={3} >
              <AreaChart data={timeseries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  hide={!showXAxis}
                  tickFormatter={dateFormatter}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  includeHidden
                  minTickGap={10}
                  interval='preserveStartEnd'
                  axisLine={false}
                  tickLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  padding={{ left: 0, right: 0 }}
                  height={20}
                />
                {showYAxis &&
                  <YAxis
                    width={40}
                    dataKey="value"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    hide={!showYAxis}
                    tickFormatter={yAxisFormatter}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
                  />}
                {showYAxis && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />}
                {showTooltip && (
                  <Tooltip
                    animationBegin={200}
                    animationDuration={400}
                    wrapperStyle={{ outline: "none" }}
                    content={
                      <CustomTooltip
                        valueFormatter={valueFormatter}
                        dateFormatter={dateFormatter}
                        onDisplay={payload => {
                          setCurrentValue(payload.value)
                          setComparisonValue(payload.comparisonValue);
                          setCurrentValueDate(payload.date);
                          setComparisonValueDate(payload.comparisonDate);
                        }}
                      />
                    }
                    allowEscapeViewBox={{ x: false, y: true }}
                    animationEasing='ease-in-out'
                  />
                )}
                {includeComparisonData && (
                  <Area
                    type="monotone"
                    dataKey='comparisonValue'
                    stroke="#878b90"
                    dot={{ r: 0 }}
                    activeDot={{ r: 2 }}
                    strokeWidth={2}
                    fill="#E2E8F0"
                    opacity={0.5}
                    strokeDasharray="4 4"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey='value'
                  stroke="#7dd3fc"
                  dot={{ r: 0 }}
                  activeDot={{ r: 2 }}
                  strokeWidth={2}
                  fill="#F2FAFE"
                >
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='h-20 my-8 text-sm text-gray-500'>
            {noDataMessage}
          </div>
        )
      }
    </ConditionalCardWrapper>
  )
}