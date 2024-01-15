"use client"

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { BsCloudSlash } from "react-icons/bs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { Skeleton } from "@/components/ui/skeleton"
import { useCallback, useState } from 'react';
import ValueDisplay from './LineChart/ValueDisplay';
import CustomTooltip from './LineChart/CustomTooltip';

const LoadingState = ({ title, includeCard = true }) => (
  includeCard ? (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-x-1'>
              {title}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-[100px] h-[30px] rounded-sm" />
        <Skeleton className="w-full h-20 rounded-sm mt-1" />
      </CardContent>
    </Card >
  ) : (
    <>
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-x-1'>
              {title}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-[100px] h-[30px] rounded-sm" />
        <Skeleton className="w-full h-20 rounded-sm mt-1" />
      </CardContent>
    </>
  )
)

export default function LineChartWithValue({
  additionalTooltipDataFormatter,
  className,
  comparisonValueKey = 'comparisonValue',
  dateKey = 'date',
  DocumentationContent,
  groupedBy,
  includeCard = true,
  includeComparisonData = true,
  includeSettingsDropdown = true,
  isExpandable = true,
  noDataMessage = (
    <div className="flex items-center justify-center">
      <BsCloudSlash size={24} className='text-gray-500 mr-2' />
      <span>No data available</span>
    </div>
  ),
  showAxis = false,
  showTooltip = true,
  timeseries,
  title,
  valueKey = 'value',
  valueFormatter = val => val,
  yAxisFormatter = val => val,
}) {
  if ([null, undefined].includes(timeseries)) return <LoadingState title={title} includeCard={includeCard} />;

  const [headerDisplayValues, setHeaderDisplayValues] = useState({
    currentValue: timeseries[timeseries.length - 1]?.[valueKey],
    comparisonValue: timeseries[timeseries.length - 1]?.[comparisonValueKey],
    currentValueDate: timeseries[timeseries.length - 1]?.[dateKey],
    comparisonValueDate: timeseries[timeseries.length - 1]?.comparisonDate,
  });

  const updateHeaderDisplayValues = useCallback(displayData => {
    setHeaderDisplayValues({
      currentValue: displayData[valueKey],
      comparisonValue: displayData[comparisonValueKey],
      currentValueDate: displayData[dateKey],
      comparisonValueDate: displayData.comparisonDate,
    })
  }, [setHeaderDisplayValues, valueKey, comparisonValueKey, dateKey])
  const [showXAxis, setShowXAxis] = useState(showAxis);
  const [showYAxis, setShowYAxis] = useState(showAxis);

  const dateFormatter = dateFormatterForGrouping(groupedBy)

  debugger;

  return (
    <>
      <ConditionalCardWrapper
        className={className}
        DocumentationContent={DocumentationContent}
        includeCard={includeCard}
        isExpandable={isExpandable}
        onSettingChange={({ attribute, valueChangedTo }) => {
          if (attribute === 'show-x-axis') {
            setShowXAxis(valueChangedTo)
          } else if (attribute === 'show-y-axis') {
            setShowYAxis(valueChangedTo)
          }
        }}
        settings={[
          { attribute: 'show-x-axis', enabled: showXAxis, label: 'Show X-Axis' },
          { attribute: 'show-y-axis', enabled: showYAxis, label: 'Show Y-Axis' }
        ]}
        title={title}
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
        {timeseries.length > 0
          ? (
            <div
              className='flex align-center justify-center mt-6'
              onMouseLeave={() => updateHeaderDisplayValues(timeseries[timeseries.length - 1])}
            >
              <ResponsiveContainer width="100%" aspect={3} >
                <AreaChart data={timeseries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey={dateKey}
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
                  <YAxis
                    width={40}
                    dataKey={valueKey}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    hide={!showYAxis}
                    tickFormatter={yAxisFormatter}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
                  />
                  {showYAxis && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} />}
                  {showTooltip && (
                    <Tooltip
                      animationBegin={200}
                      animationDuration={400}
                      wrapperStyle={{ outline: "none" }}
                      content={
                        <CustomTooltip
                          additionalDataFormatter={additionalTooltipDataFormatter}
                          comparisonValueKey={comparisonValueKey}
                          dateFormatter={dateFormatter}
                          dateKey={dateKey}
                          valueFormatter={valueFormatter}
                          valueKey={valueKey}
                          onDisplay={updateHeaderDisplayValues}
                        />
                      }
                      allowEscapeViewBox={{ x: false, y: true }}
                      animationEasing='ease-in-out'
                    />
                  )}
                  {includeComparisonData && (
                    <Area
                      type="monotone"
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
            <div className='h-20 my-8 text-sm text-gray-500'>
              {noDataMessage}
            </div>
          )
        }
      </ConditionalCardWrapper>
    </>
  )
}