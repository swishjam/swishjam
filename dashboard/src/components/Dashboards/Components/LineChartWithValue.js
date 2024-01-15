"use client"

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { BsCloudSlash } from "react-icons/bs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConditionalCardWrapper from './ConditionalCardWrapper';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton"
import { useCallback, useEffect, useState } from 'react';

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

const CustomTooltip = ({
  active,
  additionalDataFormatter,
  comparisonValueKey,
  dateFormatter,
  dateKey,
  onDisplay = () => { },
  payload,
  valueKey,
  valueFormatter,
}) => {
  useEffect(() => {
    if (active) {
      onDisplay(payload[0]?.payload)
    }
  }, [active, payload])

  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white shadow-lg">
        <CardContent className="py-2">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className='rounded-full h-[10px] w-[10px] mr-1' style={{ border: '2px solid #7dd3fc', backgroundColor: '#F2FAFE' }} />
              {dateFormatter(data[dateKey])}: {valueFormatter(data[valueKey])}
            </div>
          </div>
          {data.comparisonValue >= 0 &&
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className='rounded-full h-[10px] w-[10px] mr-1' style={{ border: '2px dashed #878b90', backgroundColor: '#E2E8F0' }} />
                {dateFormatter(data.comparisonDate)}: {valueFormatter(data[comparisonValueKey])}
              </div>
            </div>
          }
          {additionalDataFormatter && (
            <div className='text-xs text-muted-foreground mt-2 pt-2 border-t border-gray-200'>
              {additionalDataFormatter(data)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  return null;
}

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
  // const [comparisonValue, setComparisonValue] = useState(timeseries[timeseries.length - 1]?.[comparisonValueKey]);
  // const [comparisonValueDate, setComparisonValueDate] = useState(timeseries[timeseries.length - 1]?.comparisonDate);
  // const [currentValue, setCurrentValue] = useState(timeseries[timeseries.length - 1]?.[valueKey]);
  // const [currentValueDate, setCurrentValueDate] = useState(timeseries[timeseries.length - 1]?.[dateKey]);
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
        <div className="">
          <div className="text-2xl font-bold cursor-default flex">
            {typeof headerDisplayValues.currentValue !== 'undefined' ? valueFormatter(headerDisplayValues.currentValue) : ''}
            {includeComparisonData && typeof headerDisplayValues.currentValue !== 'undefined' && typeof headerDisplayValues.comparisonValue !== 'undefined' ? (
              <HoverCard>
                <HoverCardTrigger className='block w-fit ml-2 pt-2'>
                  <p className="text-xs text-muted-foreground cursor-default">
                    {headerDisplayValues.currentValue < headerDisplayValues.comparisonValue ? <ArrowTrendingDownIcon className="h-4 w-4 inline-block text-red-500 mr-1" /> : <ArrowTrendingUpIcon className="h-4 w-4 inline-block text-green-500 mr-1" />}
                    <span className='underline decoration-dotted'>{valueFormatter(Math.abs(headerDisplayValues.currentValue - headerDisplayValues.comparisonValue))}</span>
                  </p>
                </HoverCardTrigger>
                <HoverCardContent align={'center'} sideOffset={0} className='flex items-center text-gray-500'>
                  <CalendarIcon className="h-6 w-6 inline-block mr-2" />
                  <span className='text-xs'>There were {valueFormatter(headerDisplayValues.comparisonValue)} {title} on {dateFormatter(headerDisplayValues.comparisonValueDate)}.</span>
                </HoverCardContent>
              </HoverCard>
            ) : (() => {
              debugger
              return <></>
            })()}
          </div>
          <div className=''>
            <span className='text-xs font-light cursor-default block'>{headerDisplayValues.currentValueDate ? dateFormatter(headerDisplayValues.currentValueDate) : ''}</span>
          </div>
        </div>
        {timeseries.length > 0
          ? (
            <div
              className='flex align-center justify-center mt-6'
              onMouseLeave={() => {
                debugger;
                updateHeaderDisplayValues(timeseries[timeseries.length - 1])
                // setHeaderDisplayValues({
                //   currentValue: timeseries[timeseries.length - 1]?.[valueKey],
                //   comparisonValue: timeseries[timeseries.length - 1]?.[comparisonValueKey],
                //   currentValueDate: timeseries[timeseries.length - 1]?.[dateKey],
                //   comparisonValueDate: timeseries[timeseries.length - 1]?.comparisonDate,
                // })
                // setCurrentValue(timeseries[timeseries.length - 1]?.[valueKey])
                // setComparisonValue(timeseries[timeseries.length - 1]?.[comparisonValueKey]);
                // setCurrentValueDate(timeseries[timeseries.length - 1]?.[dateKey]);
                // setComparisonValueDate(timeseries[timeseries.length - 1]?.comparisonDate);
              }}
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
                          onDisplay={displayedData => {
                            updateHeaderDisplayValues(displayedData)
                            // setHeaderDisplayValues({
                            //   currentValue: displayedData[valueKey],
                            //   comparisonValue: displayedData[comparisonValueKey],
                            //   currentValueDate: displayedData[dateKey],
                            //   comparisonValueDate: displayedData.comparisonDate,
                            // })
                            // setCurrentValue(displayedData[valueKey])
                            // setComparisonValue(displayedData[comparisonValueKey]);
                            // setCurrentValueDate(displayedData[dateKey]);
                            // setComparisonValueDate(displayedData.comparisonDate);
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