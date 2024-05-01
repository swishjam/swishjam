"use client"

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, } from 'recharts';
import { BsCloudSlash } from "react-icons/bs"
import ConditionalCardWrapper from './utils/ConditionalCardWrapper';
import CustomTooltip from './AreaChart/CustomTooltip';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useCallback, useState, useEffect } from 'react';
import ValueDisplay from './AreaChart/ValueDisplay';
import BarChartTable from './BarChartTable';

const AreaChartContent = ({
  additionalTooltipDataFormatter,
  comparisonDateKey,
  comparisonValueKey,
  connectNulls,
  dateFormatter,
  dateKey,
  headerDisplayValues,
  includeComparisonData,
  includeGridLines,
  includeTable,
  includeXAxis,
  includeYAxis,
  noDataMessage,
  primaryColor,
  primaryColorFill,
  secondaryColor,
  secondaryColorFill,
  showTooltip,
  timeseries,
  title,
  updateHeaderDisplayValues,
  valueFormatter,
  valueHeader,
  valueKey,
  xAxisTitle,
  yAxisFormatter,
  yAxisTitle,
}) => (
  <>
    <ValueDisplay
      className='flex-none mb-2'
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
          className='min-h-0 flex-1'
        // onMouseLeave={() => updateHeaderDisplayValues(timeseries[timeseries.length - 1])}
        >
          <ResponsiveContainer width="100%">
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
              {includeTable && (
                <Legend
                  content={() => (
                    <div className='flex-none flex flex-wrap items-center justify-center mt-4 rounded border border-gray-200 max-h-32 overflow-scroll w-full'>
                      <BarChartTable
                        valueHeader={valueHeader}
                        barChartData={timeseries}
                        getColor={seriesType => seriesType === valueKey ? primaryColor : secondaryColor}
                        rowValueFormatter={valueFormatter}
                        rowTitleFormatter={areaType => areaType === valueKey ? 'Current period' : 'Comparison period'}
                        ignoredRowKeys={[comparisonValueKey, comparisonDateKey]}
                        dateFormatter={dateFormatter}
                      />
                      <BarChartTable
                        valueHeader={valueHeader}
                        barChartData={timeseries}
                        getColor={seriesType => seriesType === valueKey ? primaryColor : secondaryColor}
                        rowValueFormatter={valueFormatter}
                        rowTitleFormatter={areaType => areaType === valueKey ? 'Current period' : 'Comparison period'}
                        ignoredRowKeys={[valueKey, dateKey]}
                        dateKey={comparisonDateKey}
                        dateFormatter={dateFormatter}
                      />
                    </div>
                  )}
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
  </>
)

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
  includeTable: includeTableProps = true,
  isEnlargable = true,
  noDataMessage = (
    <div className="text-center">
      <BsCloudSlash size={24} className='text-gray-500 mx-auto' />
      <span className='block'>No data available</span>
    </div>
  ),
  onGroupByChange,
  primaryColor = '#7dd3fc',
  primaryColorFill = "#bde7fd",
  QueryDetails,
  secondaryColor = "#878b90",
  secondaryColorFill = "#bfc3ca",
  showAxis = false,
  showGridLines = false,
  showXAxis,
  showYAxis,
  showTooltip = true,
  subtitle,
  valueHeader,
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
  const [includeTable, setIncludeTable] = useState(includeTableProps)

  // these are all the settings that can be changed in the settings dropdown
  useEffect(() => {
    // showAxis is still being used in some places, but we should only us includeXAxis and includeYAxis in the future
    setIncludeXAxis(showXAxis ?? showAxis)
    setIncludeYAxis(showYAxis ?? showAxis)
    setIncludeComparisonData(providedIncludeComparisonData)
    setIncludeGridLines(showGridLines)
    setIncludeTable(includeTableProps)
  }, [showAxis, showXAxis, showYAxis, providedIncludeComparisonData, showGridLines, includeTableProps])

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
    { onChange: setIncludeTable, enabled: includeTable, label: 'Include Table Display' },
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
        QueryDetails={QueryDetails}
        title={title}
        settings={settingsOptions}
        subtitle={subtitle}
      >
        <AreaChartContent
          additionalTooltipDataFormatter={additionalTooltipDataFormatter}
          comparisonDateKey={comparisonDateKey}
          comparisonValueKey={comparisonValueKey}
          connectNulls={connectNulls}
          dateKey={dateKey}
          dateFormatter={dateFormatter}
          headerDisplayValues={headerDisplayValues}
          includeComparisonData={includeComparisonData}
          includeGridLines={includeGridLines}
          includeTable={includeTable}
          includeXAxis={includeXAxis}
          includeYAxis={includeYAxis}
          noDataMessage={noDataMessage}
          primaryColor={primaryColor}
          primaryColorFill={primaryColorFill}
          secondaryColor={secondaryColor}
          secondaryColorFill={secondaryColorFill}
          showTooltip={showTooltip}
          timeseries={timeseries}
          title={title}
          updateHeaderDisplayValues={updateHeaderDisplayValues}
          valueFormatter={valueFormatter}
          valueHeader={valueHeader}
          valueKey={valueKey}
          xAxisTitle={xAxisTitle}
          yAxisFormatter={yAxisFormatter}
          yAxisTitle={yAxisTitle}
        />
      </ConditionalCardWrapper>
    </>
  )
}

const FlexArea = () => (
  <div className='absolute h-[200px]'>
    <div className='parent-flex-container h-full flex flex-col'>

      <div className='flex flex-col'>
        A title
      </div>

      <div className='flex-1 min-h-0 h-full flex flex-col'>
        <div className='flex-none'>
          An element that should fit its content
        </div>
        <div className='flex-grow'>
          An element that should take the remaining space
        </div>
        <div className='flex-none flex flex-wrap items-center justify-center overflow-scroll w-full'>
          An element that should fit its content
        </div>
      </div>

    </div>
  </div>
)