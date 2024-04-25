"use client"

import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import BarChartTable from '@/components/Dashboards/Components/BarChartTable';
import { Card, CardContent } from "@/components/ui/card"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import { COLORS as DEFAULT_COLORS } from '@/lib/utils/colorHelpers';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useRef, useState } from 'react';

export default function BarChartComponent({
  className,
  colors = DEFAULT_COLORS,
  colorsByKey = {},
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
  stackOffset = 'none',
  subtitle,
  title,
  tableTitle,
  valueFormatter = val => val,
  yAxisFormatter = val => val,
  xAxisKey = 'date',
}) {
  const [includeXAxis, setIncludeXAxis] = useState(showXAxis);
  const [includeYAxis, setIncludeYAxis] = useState(showYAxis);
  const [includeGridLines, setIncludeGridLines] = useState(showGridLines);
  const [includeLegendOrTable, setIncludeLegendOrTable] = useState(showLegend);
  const [useTableInsteadOfLegend, setUseTableInsteadOfLegend] = useState(showTableInsteadOfLegend);
  const colorDict = useRef({});

  useEffect(() => {
    setIncludeXAxis(showXAxis);
    setIncludeYAxis(showYAxis);
    setIncludeGridLines(showGridLines);
    setIncludeLegendOrTable(showLegend);
    setUseTableInsteadOfLegend(showTableInsteadOfLegend);
  }, [showXAxis, showYAxis, showGridLines, showLegend, showTableInsteadOfLegend])
  console.log('useTableInsteadOfLegend', useTableInsteadOfLegend)

  if ([null, undefined].includes(data)) {
    return (
      <ConditionalCardWrapper
        includeCard={includeCard}
        title={title}
        subtitle={subtitle}
        className={className}
        includeSettingsDropdown={includeSettingsDropdown}
        isEnlargable={includeSettingsDropdown}
      >
        <Skeleton className="w-[100px] h-[30px] rounded-sm" />
        <Skeleton className="w-full h-44 rounded-sm mt-1" />
      </ConditionalCardWrapper>
    )
  }

  const dateFormatter = dateFormatterForGrouping(groupedBy)

  let uniqueKeys = [...new Set((data || []).flatMap(Object.keys))].filter(key => key !== xAxisKey);
  if (uniqueKeys.length > 50) {
    console.error('BarChart can only accept up to 50 unique keys.');
    uniqueKeys = uniqueKeys.slice(0, 50)
  }

  let colorsToChooseFrom = [...colors];
  const getColorForName = name => {
    if (!colorDict.current[name]) {
      colorDict.current[name] = colorsByKey[name] || colorsToChooseFrom.shift();
    }
    return colorDict.current[name];
  }

  const CustomTooltip = ({ payload, label }) => {
    if (!payload || payload.length === 0) return null;
    const data = payload[0]?.payload || {};
    const keysInTooltip = Object.keys(data).filter(key => key !== xAxisKey)

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <span className='block text-sm font-medium'>{dateFormatter(label)}</span>
          {keysInTooltip.map(key => {
            const color = getColorForName(key);
            return (
              <div key={key} className='flex items-center mt-1'>
                <div
                  className='transition-all rounded-full h-3 w-3 mr-2'
                  style={{ backgroundColor: color }}
                />
                <span className='transition-all text-sm text-gray-700'>
                  {key}: {yAxisFormatter(data[key])}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <ConditionalCardWrapper
      className={className}
      includeCard={includeCard}
      includeSettingsDropdown={includeSettingsDropdown}
      isEnlargable={includeSettingsDropdown}
      settings={[
        { onChange: setIncludeYAxis, label: 'Include Y-Axis', enabled: includeYAxis },
        { onChange: setIncludeXAxis, label: 'Include X-Axis', enabled: includeXAxis },
        { onChange: setIncludeLegendOrTable, label: 'Include Table/Legend', enabled: includeLegendOrTable },
        { onChange: setIncludeGridLines, label: 'Include Grid Lines', enabled: includeGridLines },
        { onChange: setUseTableInsteadOfLegend, label: 'Use Table Instead of Legend', enabled: useTableInsteadOfLegend },
      ]}
      title={title}
      subtitle={subtitle}
    >
      {data.length === 0
        ? <EmptyState msg={noDataMessage} />
        : (
          <>
            <div className={`flex align-center justify-center my-6 ${height}`}>
              <ResponsiveContainer width="100%" height='100%'>
                <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} stackOffset={stackOffset}>
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
                  {includeLegendOrTable && !useTableInsteadOfLegend && (
                    <Legend
                      content={({ payload }) => (
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
                      )}
                    />
                  )}
                  <Tooltip
                    // animationBegin={200}
                    // animationDuration={400}
                    // animationEasing='ease-in-out'
                    isAnimationActive={false}
                    content={<CustomTooltip />}
                    allowEscapeViewBox={{ x: false, y: true }}
                    wrapperStyle={{ outline: "none", zIndex: 1000 }}
                  />
                  {uniqueKeys.map((key, i, arr) => {
                    return (
                      <Bar
                        key={i}
                        dataKey={key}
                        stackId='a'
                        fill={getColorForName(key)}
                      />
                    )
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {includeLegendOrTable && useTableInsteadOfLegend && (
              <div className='w-full ml-4'>
                <BarChartTable
                  className='h-auto'
                  headers={[tableTitle || 'Value', 'Total Count']}
                  barChartData={data}
                  getColor={getColorForName}
                />
              </div>
            )}
          </>
        )
      }
    </ConditionalCardWrapper>
  )
}