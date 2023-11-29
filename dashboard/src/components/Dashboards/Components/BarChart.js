"use client"

import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import BarChartTable from '@/components/Dashboards/Components/BarChartTable';
import { Card, CardContent } from "@/components/ui/card"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import { COLORS as DEFAULT_COLORS } from '@/lib/utils/colorHelpers';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import EmptyState from '@/components/EmptyState';
import SettingsDropdown from './SettingsDropdown';
import { Skeleton } from "@/components/ui/skeleton"
import { useRef, useState } from 'react';

export default function BarChartComponent({
  colors = DEFAULT_COLORS,
  data,
  groupedBy,
  height = 'h-96',
  includeCard = true,
  includeSettingsDropdown = true,
  noDataMessage = 'No data available.',
  showGridLines = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showTableInsteadOfLegend = false,
  title,
  tableTitle,
  valueFormatter = val => val,
  yAxisFormatter = val => val,
  xAxisKey = 'date',
  className,
}) {
  if ([null, undefined].includes(data)) {
    return (
      <ConditionalCardWrapper includeCard={includeCard} title={title} className={className}>
        <Skeleton className="w-[100px] h-[30px] rounded-sm" />
        <Skeleton className="w-full h-44 rounded-sm mt-1" />
      </ConditionalCardWrapper>
    )
  }

  const [includeXAxis, setIncludeXAxis] = useState(showXAxis);
  const [includeYAxis, setIncludeYAxis] = useState(showYAxis);
  const [includeGridLines, setIncludeGridLines] = useState(showGridLines);
  const [includeLegendOrTable, setIncludeLegendOrTableOrTable] = useState(showLegend);
  const [useTableInsteadOfLegend, setUseTableInsteadOfLegend] = useState(showTableInsteadOfLegend);

  const dateFormatter = dateFormatterForGrouping(groupedBy)

  let uniqueKeys = [...new Set(data.flatMap(Object.keys))].filter(key => key !== xAxisKey);
  if (uniqueKeys.length > 50) {
    console.error('BarChart can only accept up to 50 unique keys.');
    uniqueKeys = uniqueKeys.slice(0, 50)
  } else if (uniqueKeys.length === 0) {
    return (
      <ConditionalCardWrapper includeCard={includeCard} title={title} className={className}>
        <EmptyState msg={noDataMessage} />
      </ConditionalCardWrapper>
    )
  }

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
      className={`${className} group`}
      includeCard={includeCard}
      title={
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-sm font-medium cursor-default">{title}</h2>
          {includeSettingsDropdown && (
            <SettingsDropdown
              options={[
                { name: 'Include Y-Axis', key: 'include-y-axis', isActive: includeYAxis },
                { name: 'Include X-Axis', key: 'include-x-axis', isActive: includeXAxis },
                { name: 'Include Table/Legend', key: 'include-legend-or-table', isActive: includeLegendOrTable },
                { name: 'Include Grid Lines', key: 'include-grid-lines', isActive: includeGridLines },
                { name: 'Use Table Instead of Legend', key: 'table-instead-of-legend', isActive: useTableInsteadOfLegend },
              ]}
              onSettingChange={key => {
                switch (key) {
                  case 'include-y-axis':
                    return setIncludeYAxis(!includeYAxis)
                  case 'include-x-axis':
                    return setIncludeXAxis(!includeXAxis)
                  case 'include-legend-or-table':
                    return setIncludeLegendOrTableOrTable(!includeLegendOrTable)
                  case 'include-grid-lines':
                    return setIncludeGridLines(!includeGridLines)
                  case 'table-instead-of-legend':
                    return setUseTableInsteadOfLegend(!useTableInsteadOfLegend)
                  default:
                    throw new Error(`Unrecognized setting change received: ${key}`)
                }
              }}
            />
          )}
        </div>
      }
    >
      {data.length === 0
        ? <EmptyState msg={noDataMessage} />
        : (
          <div className={`flex align-center justify-center my-6 ${height}`}>
            <ResponsiveContainer width="100%" height='100%'>
              <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                {includeGridLines && <CartesianGrid strokeDasharray="4 4" vertical={false} opacity={0.75} />}
                {includeXAxis && <XAxis dataKey={xAxisKey} tickFormatter={dateFormatter} angle={0} tick={{ fontSize: '12px' }} />}
                {includeYAxis &&
                  <YAxis
                    width={40}
                    tick={{ fontSize: '12px', fill: "#9CA3AF" }}
                    tickFormatter={yAxisFormatter}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
                  />
                }
                {includeLegendOrTable && (
                  <Legend
                    content={({ payload }) => {
                      return (
                        useTableInsteadOfLegend
                          ? (null) : (
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

            {includeLegendOrTable && useTableInsteadOfLegend && (
              <div className='w-96 ml-4 -mt-6'>
                <BarChartTable headers={[tableTitle || 'Value', 'Total Count']} barChartData={data} getColor={getColorForName} />
              </div>
            )}
          </div>
        )
      }
    </ConditionalCardWrapper>
  )
}