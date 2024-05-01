"use client"

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, } from 'recharts';
import { BsCloudSlash } from "react-icons/bs"
import CustomTooltip from '@/components/DataVisualizations/AreaChart/CustomTooltip';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useCallback, useState, useEffect } from 'react';
import ValueDisplay from '@/components/DataVisualizations/AreaChart/ValueDisplay';
import BarChartTable from '@/components/DataVisualizations/BarChartTable';
import defineComponentAsDataVisualization from '@/components/DataVisualizations/DataVisualizationWrapper';
import useDataVisualizationSettings from '@/hooks/useDataVisualizationSettings';

const AreaChartWithValue = ({
  additionalTooltipDataFormatter,
  connectNulls = false,
  comparisonDateKey = 'comparisonDate',
  comparisonValueKey = 'comparisonValue',
  dateKey = 'date',
  groupedBy,
  includeComparisonData: providedIncludeComparisonData = true,
  legendType: providedLegendType = 'none',
  noDataMessage = (
    <div className="text-center">
      <BsCloudSlash size={24} className='text-gray-500 mx-auto' />
      <span className='block'>No data available</span>
    </div>
  ),
  onGroupByChange,
  primaryColor = '#7dd3fc',
  primaryColorFill = "#bde7fd",
  secondaryColor = "#878b90",
  secondaryColorFill = "#bfc3ca",
  showGridLines = false,
  showXAxis,
  showYAxis,
  showTooltip = true,
  valueHeader,
  data,
  title,
  valueKey = 'value',
  valueFormatter = val => val,
  xAxisTitle,
  yAxisFormatter = val => val,
  yAxisTitle,
}) => {
  const [headerDisplayValues, setHeaderDisplayValues] = useState({
    currentValue: data?.[data?.length - 1]?.[valueKey],
    comparisonValue: data?.[data?.length - 1]?.[comparisonValueKey],
    currentValueDate: data?.[data?.length - 1]?.[dateKey],
    comparisonValueDate: data?.[data?.length - 1]?.[comparisonDateKey],
  });
  const { getSetting, updateSetting } = useDataVisualizationSettings();
  const includeXAxis = getSetting('include-x-axis') ?? showXAxis;
  const includeYAxis = getSetting('include-y-axis') ?? showYAxis;
  const includeComparisonData = getSetting('include-comparison-data') ?? providedIncludeComparisonData;
  const includeGridLines = getSetting('include-grid-lines') ?? showGridLines;
  const legendType = getSetting('legend-type') ?? providedLegendType;

  // these are all the settings that can be changed in the settings dropdown
  useEffect(() => {
    updateSetting('include-x-axis', showXAxis);
    updateSetting('include-y-axis', showYAxis);
    updateSetting('include-comparison-data', providedIncludeComparisonData);
    updateSetting('include-grid-lines', showGridLines);
    updateSetting('legend-type', providedLegendType);
  }, [showXAxis, showYAxis, providedIncludeComparisonData, showGridLines, providedLegendType])

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
    if (!data) return;
    updateHeaderDisplayValues(data[data.length - 1])
  }, [data, valueKey, comparisonValueKey, dateKey, groupedBy])

  if (data && data.length === 0) {
    return (
      <div className='h-20 my-8 text-sm text-gray-500 flex items-center justify-center'>
        {noDataMessage}
      </div>
    )
  }

  return (
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
      <div
        className='min-h-0 flex-1'
      // onMouseLeave={() => updateHeaderDisplayValues(data[data.length - 1])}
      >
        <ResponsiveContainer width="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: yAxisTitle ? 20 : 0, bottom: xAxisTitle ? 20 : 0 }}>
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
            {legendType && legendType !== 'none' && (
              <Legend
                content={() => (
                  <div className='flex-none flex flex-wrap items-center justify-center mt-4 rounded border border-gray-200 max-h-32 overflow-scroll w-full'>
                    <BarChartTable
                      valueHeader={valueHeader}
                      barChartData={data}
                      getColor={seriesType => seriesType === valueKey ? primaryColor : secondaryColor}
                      rowValueFormatter={valueFormatter}
                      rowTitleFormatter={areaType => areaType === valueKey ? 'Current period' : 'Comparison period'}
                      ignoredRowKeys={[comparisonValueKey, comparisonDateKey]}
                      dateFormatter={dateFormatter}
                    />
                    <BarChartTable
                      valueHeader={valueHeader}
                      barChartData={data}
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
    </>
  )
}

export default defineComponentAsDataVisualization(AreaChartWithValue, {
  settings: [
    { id: 'include-x-axis', label: 'Show X-Axis' },
    { id: 'include-y-axis', label: 'Show Y-Axis' },
    { id: 'include-grid-lines', label: 'Show Grid Lines' },
    { id: 'include-comparison-data', label: 'Include Comparison Data' },
    {
      id: 'legend-type',
      label: 'Legend Display',
      options: [
        { value: 'none' },
        { value: 'table' }
      ]
    },
    // onGroupByChange && {
    //   onChange: onGroupByChange,
    //   label: <span className='capitalize'>Group By <span className='duration-500 transition-all group-hover:text-swishjam underline decoration-dotted italic'>{groupedBy}</span></span>,
    //   options: [
    //     { value: 'hour', enabled: groupedBy === 'hour' },
    //     { value: 'day', enabled: groupedBy === 'day' },
    //     { value: 'week', enabled: groupedBy === 'week' },
    //     { value: 'month', enabled: groupedBy === 'month' },
    //   ]
    // }
  ]
})