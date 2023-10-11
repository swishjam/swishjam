"use client"

import { useState } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon, Cog8ToothIcon } from "@heroicons/react/24/outline";
import { CircleIcon } from "@radix-ui/react-icons"
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EmptyState from '@/components/EmptyState';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';

const LoadingState = ({ title }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="w-[100px] h-[30px] rounded-sm" />
      <Skeleton className="w-full h-20 rounded-sm mt-1" />
    </CardContent>
  </Card>
)

const CustomTooltip = ({ active, payload, label, valueFormatter, dateFormatter, includeComparison }) => {
  if (active && payload && payload.length) {
    let data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CircleIcon className="mr-1 h-3 w-3" style={{ color: '#7dd3fc', fill: '#F2FAFE' }} />
              {valueFormatter(data.value)} - {dateFormatter(data.date)}
            </div>
          </div>
          {includeComparison && data.comparisonValue >= 0 &&
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CircleIcon className="mr-1 h-3 w-3" style={{ color: '#878b90', fill: '#E2E8F0' }} />
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

const SettingsDropdown = ({ includeComparisonLine, showXAxis, showYAxis, onXAxisChange, onYAxisChange, onIncludeComparisonChange, onSettingChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Cog8ToothIcon className={`group-active:opacity-100 group-focus:opacity-100 group-hover:opacity-100 ring-0 opacity-0 duration-500 transition h-5 w-5 text-gray-500 cursor-pointer`} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        className={`cursor-pointer ${showXAxis ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = showXAxis;
          const valueChangedTo = !showXAxis;
          onXAxisChange(valueChangedTo)
          onSettingChange({
            attribute: 'show-y-axis',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {showXAxis ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='mx-6'>Show X-Axis</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={`cursor-pointer ${showYAxis ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = showYAxis;
          const valueChangedTo = !showYAxis;
          onYAxisChange(valueChangedTo)
          onSettingChange({
            attribute: 'show-x-axis',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {showYAxis ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='ml-6'>Show Y-Axis</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={`cursor-pointer ${includeComparisonLine ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = includeComparisonLine;
          const valueChangedTo = !includeComparisonLine;
          onIncludeComparisonChange(valueChangedTo)
          onSettingChange({
            attribute: 'include-comparison',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {includeComparisonLine ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='ml-6'>Include Comparison Data</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export default function LineChartWithValue({
  title,
  value,
  previousValue,
  previousValueDate,
  timeseries,
  groupedBy,
  noDataMessage = 'No data available.',
  includeComparisonData = true,
  includeSettingsDropdown = true,
  showAxis = false,
  valueFormatter = val => val,
  onSettingChange = () => { },
}) {
  const [showXAxis, setShowXAxis] = useState(showAxis);
  const [showYAxis, setShowYAxis] = useState(showAxis);
  const [includeComparisonLine, setIncludeComparisonLine] = useState(includeComparisonData);
  if ([null, undefined].includes(value) || [null, undefined].includes(timeseries)) return <LoadingState title={title} />;

  const changeInValue = typeof previousValue !== 'undefined' ? value - previousValue : null;

  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
        {includeSettingsDropdown && (
          <SettingsDropdown
            includeComparisonLine={includeComparisonLine}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            onYAxisChange={setShowYAxis}
            onXAxisChange={setShowXAxis}
            onIncludeComparisonChange={setIncludeComparisonLine}
            onSettingChange={onSettingChange}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex">
          <div className="text-2xl font-bold cursor-default">
            {valueFormatter(value)}
          </div>
          {changeInValue && changeInValue !== 0 ? (
            <HoverCard>
              <HoverCardTrigger className='block w-fit ml-2 pt-2'>
                <p className="text-xs text-muted-foreground cursor-default">
                  {changeInValue < 0 ? <ArrowTrendingDownIcon className="h-4 w-4 inline-block text-red-500 mr-1" /> : <ArrowTrendingUpIcon className="h-4 w-4 inline-block text-green-500 mr-1" />}
                  <span className='underline decoration-dotted'>{valueFormatter(Math.abs(changeInValue))}</span>
                </p>
              </HoverCardTrigger>
              <HoverCardContent className='flex items-center text-gray-500'>
                <CalendarIcon className="h-6 w-6 inline-block mr-2" />
                <span className='text-xs'>{title} was measured at {valueFormatter(previousValue)} on {new Date(previousValueDate).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}.</span>
              </HoverCardContent>
            </HoverCard>
          ) : <></>}
        </div>
        {timeseries.length > 0
          ? (
            <div className='flex align-center justify-center my-6'>
              <ResponsiveContainer width="100%" aspect={3}>
                <AreaChart data={timeseries} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    className='group-hover:opacity-100 opacity-0 duration-500 transition'
                    dataKey="date"
                    hide={!showXAxis}
                    tickLine={false}
                    tickFormatter={dateFormatterForGrouping(groupedBy)}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    includeHidden
                    interval={'preserveStartEnd'}
                  />
                  <YAxis dataKey="value" hide={!showYAxis} tickFormatter={valueFormatter} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                  {showYAxis && <CartesianGrid strokeDasharray="4 4" vertical={false} opacity={0.75} />}
                  <Tooltip
                    animationBegin={200}
                    animationDuration={400}
                    wrapperStyle={{ outline: "none" }}
                    content={<CustomTooltip valueFormatter={valueFormatter} dateFormatter={dateFormatterForGrouping(groupedBy)} includeComparison={includeComparisonLine} />}
                    allowEscapeViewBox={{ x: false, y: true }}
                    animationEasing='ease-in-out'
                  />
                  {includeComparisonLine && (
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState msg={noDataMessage} />
          )
        }
      </CardContent>
    </Card>
  )
}