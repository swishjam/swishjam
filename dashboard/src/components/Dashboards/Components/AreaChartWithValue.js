"use client"

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { BsCloudSlash } from "react-icons/bs"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import CustomTooltip from './AreaChart/CustomTooltip';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useCallback, useState, useEffect } from 'react';
import ValueDisplay from './AreaChart/ValueDisplay';
import BarChartTable from './BarChartTable';

export default function AreaChartWithValue({
  additionalTooltipDataFormatter,
  className,
  connectNulls = false,
  comparisonDateKey = 'comparisonDate',
  comparisonValueKey = 'comparisonValue',
  dateKey = 'date',
  DocumentationContent,
  groupedBy,
  includeCard = true,
  includeComparisonData: providedIncludeComparisonData = true,
  includeSettingsDropdown = true,
  includeTable = true,
  isEnlargable = true,
  noDataMessage = (
    <div className="text-center">
      <BsCloudSlash size={24} className='text-gray-500 mx-auto' />
      <span className='block'>No data available</span>
    </div>
  ),
  onGroupByChange,
  primaryColor = '#7dd3fc',
  primaryColorFill = "#F2FAFE",
  secondaryColor = "#878b90",
  secondaryColorFill = "#E2E8F0",
  showAxis = false,
  showGridLines = false,
  showXAxis,
  showYAxis,
  showTooltip = true,
  subtitle,
  tableTitle,
  timeseries,
  title,
  valueKey = 'value',
  valueFormatter = val => val,
  xAxisTitle,
  yAxisFormatter = val => val,
  yAxisTitle,
}) {
  const [headerDisplayValues, setHeaderDisplayValues] = useState({
    currentValue: timeseries?.[timeseries?.length - 1]?.[valueKey],
    comparisonValue: timeseries?.[timeseries?.length - 1]?.[comparisonValueKey],
    currentValueDate: timeseries?.[timeseries?.length - 1]?.[dateKey],
    comparisonValueDate: timeseries?.[timeseries?.length - 1]?.[comparisonDateKey],
  });
  const [includeXAxis, setIncludeXAxis] = useState();
  const [includeYAxis, setIncludeYAxis] = useState();
  const [includeComparisonData, setIncludeComparisonData] = useState();
  const [includeGridLines, setIncludeGridLines] = useState();

  // these are all the settings that can be changed in the settings dropdown
  useEffect(() => {
    // showAxis is still being used in some places, but we should only us includeXAxis and includeYAxis in the future
    setIncludeXAxis(showXAxis ?? showAxis)
    setIncludeYAxis(showYAxis ?? showAxis)
    setIncludeComparisonData(providedIncludeComparisonData)
    setIncludeGridLines(showGridLines)
  }, [showAxis, showXAxis, showYAxis, providedIncludeComparisonData, showGridLines])

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
    { onChange: setIncludeXAxis, enabled: includeXAxis, label: 'Show X-Axis' },
    { onChange: setIncludeYAxis, enabled: includeYAxis, label: 'Show Y-Axis' },
    { onChange: setIncludeGridLines, enabled: includeGridLines, label: 'Show Grid Lines' },
    { onChange: setIncludeComparisonData, enabled: includeComparisonData, label: 'Include Comparison Data' },
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
                <AreaChart data={timeseries} margin={{ top: 5, right: 0, left: yAxisTitle ? 20 : 0, bottom: xAxisTitle ? 20 : 0 }}>
                  <XAxis
                    axisLine={false}
                    dataKey={dateKey}
                    hide={!includeXAxis}
                    height={20}
                    includeHidden
                    interval='preserveStartEnd'
                    label={xAxisTitle ? { value: xAxisTitle, offset: -15, position: 'insideBottom', fill: '#7b7b7b', fontSize: 14 } : null}
                    minTickGap={10}
                    // padding={{ left: 0, right: 0 }}
                    tickFormatter={dateFormatter}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    tickLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    hide={!includeYAxis}
                    label={yAxisTitle ? { value: yAxisTitle, angle: -90, offset: -2, position: 'insideLeft', fill: '#7b7b7b', fontSize: 14 } : null}
                    // padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    tickFormatter={yAxisFormatter}
                    tickLine={false}
                    width={40}
                  />
                  {includeGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />}
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
                          onDisplay={updateHeaderDisplayValues}
                          primaryColor={primaryColor}
                          primaryColorFill={primaryColorFill}
                          secondaryColor={secondaryColor}
                          secondaryColorFill={secondaryColorFill}
                          valueFormatter={valueFormatter}
                          valueKey={valueKey}
                        />
                      }
                      isAnimationActive={false}
                      wrapperStyle={{ outline: "none", zIndex: 1000 }}
                    />
                  )}
                  {includeComparisonData && (
                    <Area
                      type="monotone"
                      connectNulls={connectNulls}
                      dataKey={comparisonValueKey}
                      stroke={secondaryColor}
                      dot={{ r: 0 }}
                      activeDot={{ r: 2 }}
                      strokeWidth={2}
                      fill={secondaryColorFill}
                      opacity={0.5}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Area
                    type="monotone"
                    connectNulls={connectNulls}
                    dataKey={valueKey}
                    stroke={primaryColor}
                    dot={{ r: 0 }}
                    activeDot={{ r: 2 }}
                    strokeWidth={2}
                    fill={primaryColorFill}
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
        {includeTable && (
          <BarChartTable
            className='h-auto mt-4'
            headers={[tableTitle || 'Value', 'Total Count']}
            barChartData={timeseries}
            getColor={seriesType => seriesType === valueKey ? primaryColor : secondaryColor}
            countDisplayFormatter={valueFormatter}
            valueDisplayFormatter={areaType => (
              areaType === valueKey
                ? `Current period (${dateFormatter(timeseries[0]?.[dateKey])} - ${dateFormatter(timeseries[timeseries.length - 1]?.[dateKey])})`
                : `Comparison period (${dateFormatter(timeseries[0]?.[comparisonDateKey])} - ${dateFormatter(timeseries[timeseries.length - 1]?.[comparisonDateKey])})`)
            }
            ignoredKeys={[dateKey, comparisonDateKey]}
          />
        )}
      </ConditionalCardWrapper>
    </>
  )
}