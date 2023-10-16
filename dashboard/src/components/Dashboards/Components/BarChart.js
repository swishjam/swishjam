"use client"

import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { CircleIcon } from "@radix-ui/react-icons"
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import ConditionalCardWrapper from './ConditionalCardWrapper';
import { COLORS as DEFAULT_COLORS } from '@/lib/utils/colorHelpers';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EmptyState from '@/components/EmptyState';
import { Skeleton } from "@/components/ui/skeleton"
import { useRef, useState } from 'react';

const SettingsDropdown = ({
  includeGridLines,
  includeLegend,
  includeXAxis,
  includeYAxis,
  onIncludeGridLinesChange,
  onIncludeLegendChange,
  onSettingChange,
  onXAxisChange,
  onYAxisChange,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Cog8ToothIcon className='group-active:opacity-100 group-focus:opacity-100 group-hover:opacity-100 ring-0 opacity-0 duration-500 transition h-5 w-5 text-gray-500 cursor-pointer' />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        className={`cursor-pointer ${includeXAxis ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = includeXAxis;
          const valueChangedTo = !includeXAxis;
          onXAxisChange(valueChangedTo)
          onSettingChange({
            attribute: 'show-x-axis',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {includeXAxis ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='mx-6'>Show X-Axis</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={`cursor-pointer ${includeYAxis ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = includeYAxis;
          const valueChangedTo = !includeYAxis;
          onYAxisChange(valueChangedTo)
          onSettingChange({
            attribute: 'show-y-axis',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {includeYAxis ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='ml-6'>Show Y-Axis</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={`cursor-pointer ${includeGridLines ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = includeGridLines;
          const valueChangedTo = !includeGridLines;
          onIncludeGridLinesChange(valueChangedTo)
          onSettingChange({
            attribute: 'include-grid-lines',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {includeGridLines ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='ml-6'>Include Grid Lines</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={`cursor-pointer ${includeLegend ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
        onClick={() => {
          const valueChangedFrom = includeLegend;
          const valueChangedTo = !includeLegend;
          onIncludeLegendChange(valueChangedTo)
          onSettingChange({
            attribute: 'include-legend',
            valueWas: valueChangedFrom,
            value: valueChangedTo
          })
        }}
      >
        {includeLegend ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
        <span className='ml-6'>Include Legend</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export default function BarChartComponent({
  colors = DEFAULT_COLORS,
  data,
  groupedBy,
  height = 'h-96',
  includeCard = true,
  includeSettingsDropdown = true,
  noDataMessage = 'No data available.',
  onSettingChange = () => { },
  showGridLines = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  title,
  valueFormatter = val => val,
  xAxisKey = 'date',
}) {
  if ([null, undefined].includes(data)) {
    return (
      <ConditionalCardWrapper includeCard={includeCard} title={title}>
        <Skeleton className="w-[100px] h-[30px] rounded-sm" />
        <Skeleton className="w-full h-44 rounded-sm mt-1" />
      </ConditionalCardWrapper>
    )
  }

  const [includeXAxis, setIncludeXAxis] = useState(showXAxis);
  const [includeYAxis, setIncludeYAxis] = useState(showYAxis);
  const [includeGridLines, setIncludeGridLines] = useState(showGridLines);
  const [includeLegend, setIncludeLegend] = useState(showLegend);

  const dateFormatter = dateFormatterForGrouping(groupedBy)

  const uniqueKeys = [...new Set(data.flatMap(Object.keys))].filter(key => key !== xAxisKey);

  const colorDict = useRef({});
  let colorsToChooseFrom = [...colors];
  const getColorForName = name => {
    if (!colorDict.current[name]) {
      colorDict.current[name] = colorsToChooseFrom.shift();
    }
    return colorDict.current[name];
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const keysInTooltip = Object.keys(data).filter(key => key !== xAxisKey)

      return (
        <Card className="z-[50000] bg-white">
          <CardContent className="py-2">
            <span className='block text-sm font-medium'>{dateFormatter(data[xAxisKey])}</span>
            {keysInTooltip.map(key => {
              const color = getColorForName(key);
              return (
                <div key={key} className='flex items-center mt-1'>
                  <div
                    className='transition-all rounded-full h-3 w-3 mr-2'
                    style={{ backgroundColor: color }}
                  />
                  <span className='transition-all text-sm text-gray-700'>
                    {key}: {data[key]}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  return (
    <ConditionalCardWrapper
      className='group'
      includeCard={includeCard}
      title={
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-sm font-medium cursor-default">{title}</h2>
          {includeSettingsDropdown && (
            <SettingsDropdown
              includeGridLines={includeGridLines}
              includeXAxis={includeXAxis}
              includeYAxis={includeYAxis}
              includeLegend={includeLegend}
              onYAxisChange={setIncludeYAxis}
              onXAxisChange={setIncludeXAxis}
              onIncludeLegendChange={setIncludeLegend}
              onIncludeGridLinesChange={setIncludeGridLines}
              onSettingChange={onSettingChange}
            />
          )}
        </div>
      }
    >
      {data.length === 0
        ? <EmptyState msg={noDataMessage} />
        : (
          <div className={`flex align-center justify-center my-6 ${height}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                {includeGridLines && <CartesianGrid strokeDasharray="4 4" vertical={false} opacity={0.75} />}
                {includeXAxis && <XAxis dataKey={xAxisKey} tickFormatter={dateFormatter} angle={0} tick={{ fontSize: '12px' }} />}
                {includeYAxis && <YAxis tick={{ fontSize: '12px' }} tickFormatter={valueFormatter} />}
                {includeLegend && (
                  <Legend
                    content={({ payload }) => {
                      return (
                        <div className='flex flex-wrap items-center justify-center gap-2 border border-gray-200 px-4 py-2 mt-4 rounded max-h-24 overflow-scroll'>
                          {payload.map((entry, index) => (
                            <div key={index} className='inline-flex items-center justify-center w-fit rounded-md transition-all px-2 py-1'>
                              <div className='transition-all rounded-full h-2 w-2 mr-2' style={{ backgroundColor: entry.color }} />
                              <span className='transition-all text-xs text-gray-700'>
                                {valueFormatter(entry.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                )}
                <Tooltip
                  animationBegin={200}
                  animationDuration={400}
                  wrapperStyle={{ outline: "none" }}
                  content={<CustomTooltip />}
                  allowEscapeViewBox={{ x: false, y: true }}
                  animationEasing='ease-in-out'
                />
                {uniqueKeys.map((key, i) => <Bar key={i} dataKey={key} stackId='a' fill={getColorForName(key)} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }
    </ConditionalCardWrapper>
  )
}