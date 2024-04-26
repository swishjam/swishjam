"use client"

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { BsCloudSlash } from "react-icons/bs"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import CustomTooltip from './LineChart/CustomTooltip';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useCallback, useState, useEffect } from 'react';
import ValueDisplay from './LineChart/ValueDisplay';

export default function LineChartWithValue({
  additionalTooltipDataFormatter,
  className,
  connectNulls = false,
  comparisonDateKey = 'comparisonDate',
  comparisonValueKey = 'comparisonValue',
  dateKey = 'date',
  DocumentationContent,
  groupedBy,
  includeCard = true,
  includeComparisonData = true,
  includeSettingsDropdown = true,
  isEnlargable = true,
  noDataMessage = (
    <div className="text-center">
      <BsCloudSlash size={24} className='text-gray-500 mx-auto' />
      <span className='block'>No data available</span>
    </div>
  ),
  onGroupByChange,
  showAxis = false,
  showTooltip = true,
  subtitle,
  timeseries,
  title,
  valueKey = 'value',
  valueFormatter = val => val,
  yAxisFormatter = val => val,
}) {
  const [headerDisplayValues, setHeaderDisplayValues] = useState({
    currentValue: timeseries?.[timeseries?.length - 1]?.[valueKey],
    comparisonValue: timeseries?.[timeseries?.length - 1]?.[comparisonValueKey],
    currentValueDate: timeseries?.[timeseries?.length - 1]?.[dateKey],
    comparisonValueDate: timeseries?.[timeseries?.length - 1]?.[comparisonDateKey],
  });
  const [showXAxis, setShowXAxis] = useState(showAxis);
  const [showYAxis, setShowYAxis] = useState(showAxis);
  const [showComparisonData, setShowComparisonData] = useState(includeComparisonData);

  const updateHeaderDisplayValues = useCallback(displayData => {
    setHeaderDisplayValues({
      currentValue: displayData?.[valueKey],
      comparisonValue: displayData?.[comparisonValueKey],
      currentValueDate: displayData?.[dateKey],
      comparisonValueDate: displayData?.[comparisonDateKey],
    })
  }, [setHeaderDisplayValues, valueKey, comparisonValueKey, dateKey, comparisonDateKey])

  const dateFormatter = dateFormatterForGrouping(groupedBy)

  useEffect(() => {
    if (!timeseries) return;
    updateHeaderDisplayValues(timeseries[timeseries.length - 1])
  }, [timeseries, valueKey, comparisonValueKey, dateKey, groupedBy])

  const settingsOptions = [
    { onChange: setShowXAxis, enabled: showXAxis, label: 'Show X-Axis' },
    { onChange: setShowYAxis, enabled: showYAxis, label: 'Show Y-Axis' },
    { onChange: setShowComparisonData, enabled: showComparisonData, label: 'Include Comparison Data' },
    onGroupByChange && {
      onChange: onGroupByChange,
      label: <span className='capitalize'>Group By <span className='duration-500 transition-all group-hover:text-swishjam underline decoration-dotted italic'>{groupedBy}</span></span>,
      options: [
        { value: 'hour', enabled: groupedBy === 'hour' },
        { value: 'day', enabled: groupedBy === 'day' },
        { value: 'week', enabled: groupedBy === 'week' },
        { value: 'month', enabled: groupedBy === 'month' },
      ]
    }
  ].filter(Boolean)

  return (
    <>
      <ConditionalCardWrapper
        className={className}
        DocumentationContent={DocumentationContent}
        includeCard={includeCard}
        includeSettingsDropdown={includeSettingsDropdown}
        isEnlargable={isEnlargable}
        loading={[null, undefined].includes(timeseries)}
        settings={settingsOptions}
        title={title}
        subtitle={subtitle}
      >
        <ValueDisplay
          comparisonDate={headerDisplayValues.comparisonValueDate}
          comparisonValue={headerDisplayValues.comparisonValue}
          date={headerDisplayValues.currentValueDate}
          dateFormatter={dateFormatter}
          title={title}
          value={headerDisplayValues.currentValue}
          valueFormatter={valueFormatter}
        />
        {timeseries?.length > 0
          ? (
            <div
              className='flex align-center justify-center mt-6'
              onMouseLeave={() => updateHeaderDisplayValues(timeseries[timeseries.length - 1])}
            >
              <ResponsiveContainer width="100%" aspect={3} >
                <AreaChart data={timeseries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    axisLine={false}
                    dataKey={dateKey}
                    hide={!showXAxis}
                    height={20}
                    includeHidden
                    interval='preserveStartEnd'
                    minTickGap={10}
                    padding={{ left: 0, right: 0 }}
                    tickFormatter={dateFormatter}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    tickLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    hide={!showYAxis}
                    padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    tickFormatter={yAxisFormatter}
                    tickLine={false}
                    width={40}
                  />
                  {showYAxis && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />}
                  {showTooltip && (
                    <Tooltip
                      allowEscapeViewBox={{ x: false, y: true }}
                      // animationBegin={200}
                      // animationDuration={400}
                      // animationEasing='ease-in-out'
                      content={
                        <CustomTooltip
                          additionalDataFormatter={additionalTooltipDataFormatter}
                          comparisonDateKey={comparisonDateKey}
                          comparisonValueKey={comparisonValueKey}
                          dateFormatter={dateFormatter}
                          dateKey={dateKey}
                          valueFormatter={valueFormatter}
                          valueKey={valueKey}
                          onDisplay={updateHeaderDisplayValues}
                        />
                      }
                      isAnimationActive={false}
                      wrapperStyle={{ outline: "none", zIndex: 1000 }}
                    />
                  )}
                  {showComparisonData && (
                    <Area
                      type="monotone"
                      connectNulls={connectNulls}
                      dataKey={comparisonValueKey}
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
                    connectNulls={connectNulls}
                    dataKey={valueKey}
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
            <div className='h-20 my-8 text-sm text-gray-500 flex items-center justify-center'>
              {noDataMessage}
            </div>
          )
        }
      </ConditionalCardWrapper>
    </>
  )
}