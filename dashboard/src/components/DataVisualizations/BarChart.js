"use client"

import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import BarChartTable from '@/components/DataVisualizations/BarChartTable';
import { Card, CardContent } from "@/components/ui/card"
import { COLORS as DEFAULT_COLORS } from '@/lib/utils/colorHelpers';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import EmptyState from '@/components/EmptyState';
import { useEffect, useRef } from 'react';
import defineComponentAsDataVisualization from './DataVisualizationWrapper';
import useDataVisualizationSettings from '@/hooks/useDataVisualizationSettings';

const CustomTooltip = ({ payload, label, dateFormatter, getColorForName, yAxisFormatter, xAxisKey }) => {
  if (!payload || payload.length === 0) return null;
  const data = payload[0].payload || {};
  const keysInTooltip = Object.keys(data).filter(key => key !== xAxisKey).sort((a, b) => data[b] - data[a]);

  return (
    <Card className="z-[50000] bg-white shadow-xl">
      <CardContent className="py-2">
        <span className='block text-sm font-medium'>{dateFormatter(label)}</span>
        {keysInTooltip.map(key => (
          <div key={key} className='flex items-center mt-1'>
            <div
              className='transition-all rounded-full h-3 w-3 mr-2'
              style={{ backgroundColor: getColorForName(key) }}
            />
            <span className='transition-all text-sm text-gray-700'>
              {key}: {yAxisFormatter(data[key])}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const BarChartComponent = ({
  colors = DEFAULT_COLORS,
  colorsByKey = {},
  data,
  groupedBy,
  noDataMessage = 'No data available.',
  showGridLines = true,
  legendType: providedLegendType = 'legend',
  showXAxis = true,
  showYAxis = true,
  stackOffset = 'none',
  valueHeader,
  valueFormatter = val => val,
  yAxisFormatter = val => val,
  xAxisKey = 'date',
}) => {
  const { getSetting, updateSettings } = useDataVisualizationSettings();
  const includeXAxis = getSetting('include-x-axis')
  const includeYAxis = getSetting('include-y-axis')
  const includeGridLines = getSetting('include-grid-lines')
  const legendType = getSetting('legend-type')

  const colorDict = useRef({});

  useEffect(() => {
    updateSettings([
      { id: 'legend-type', value: providedLegendType },
      { id: 'include-y-axis', value: showYAxis },
      { id: 'include-x-axis', value: showXAxis },
      { id: 'include-grid-lines', value: showGridLines },
    ])
  }, [showXAxis, showYAxis, showGridLines, providedLegendType])

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

  if (uniqueKeys.length === 0) {
    return <EmptyState msg={noDataMessage} />
  }

  return (
    <ResponsiveContainer width="100%">
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
        {legendType !== 'none' && (
          <Legend
            content={({ payload }) => {
              if (legendType === 'table') {
                return (
                  <div className='flex flex-wrap items-center justify-center mt-4 rounded border border-gray-200 max-h-32 overflow-scroll w-full'>
                    <BarChartTable
                      valueHeader={valueHeader}
                      barChartData={data}
                      getColor={getColorForName}
                      dateFormatter={dateFormatter}
                    />
                  </div>
                )
              } else if (legendType === 'legend') {
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
              }
            }}
          />
        )}
        <Tooltip
          isAnimationActive={false}
          content={
            <CustomTooltip
              dateFormatter={dateFormatter}
              getColorForName={getColorForName}
              yAxisFormatter={yAxisFormatter}
              xAxisKey={xAxisKey}
            />
          }
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
  )
}

export default defineComponentAsDataVisualization(BarChartComponent, {
  settings: [
    { id: 'include-y-axis', label: 'Include Y-Axis' },
    { id: 'include-x-axis', label: 'Include X-Axis' },
    { id: 'include-grid-lines', label: 'Include Grid Lines' },
    {
      id: 'legend-type',
      label: 'Legend Display',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Table', value: 'table' },
        { label: 'Legend', value: 'legend' },
      ]
    }
  ]
});










// "use client"

// import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import BarChartTable from '@/components/DataVisualizations/BarChartTable';
// import { Card, CardContent } from "@/components/ui/card"
// import ConditionalCardWrapper from './utils/ConditionalCardWrapper';
// import { COLORS as DEFAULT_COLORS } from '@/lib/utils/colorHelpers';
// import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
// import EmptyState from '@/components/EmptyState';
// import { useEffect, useRef, useState } from 'react';
// import defineComponentAsDataVisualization from './DataVisualizationWrapper';

// const CustomTooltip = ({ payload, label, dateFormatter, getColorForName, yAxisFormatter, xAxisKey }) => {
//   if (!payload || payload.length === 0) return null;
//   const data = payload[0].payload || {};
//   const keysInTooltip = Object.keys(data).filter(key => key !== xAxisKey).sort((a, b) => data[b] - data[a]);

//   return (
//     <Card className="z-[50000] bg-white shadow-xl">
//       <CardContent className="py-2">
//         <span className='block text-sm font-medium'>{dateFormatter(label)}</span>
//         {keysInTooltip.map(key => (
//           <div key={key} className='flex items-center mt-1'>
//             <div
//               className='transition-all rounded-full h-3 w-3 mr-2'
//               style={{ backgroundColor: getColorForName(key) }}
//             />
//             <span className='transition-all text-sm text-gray-700'>
//               {key}: {yAxisFormatter(data[key])}
//             </span>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

// const BarChartContent = ({
//   data,
//   dateFormatter,
//   getColorForName,
//   includeGridLines,
//   includeLegendOrTable,
//   includeXAxis,
//   includeYAxis,
//   noDataMessage,
//   stackOffset,
//   valueHeader,
//   uniqueKeys,
//   useTableInsteadOfLegend,
//   valueFormatter,
//   xAxisKey,
//   yAxisFormatter,
// }) => (
//   uniqueKeys.length === 0
//     ? <EmptyState msg={noDataMessage} />
//     : (
//       <ResponsiveContainer width="100%">
//         <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} stackOffset={stackOffset}>
//           {includeGridLines && <CartesianGrid strokeDasharray="4 4" vertical={false} opacity={0.75} />}
//           {includeXAxis && <XAxis dataKey={xAxisKey} tickFormatter={dateFormatter} angle={0} tick={{ fontSize: '12px' }} />}
//           {includeYAxis &&
//             <YAxis
//               width={40}
//               tick={{ fontSize: '12px', fill: "#9CA3AF" }}
//               tickFormatter={yAxisFormatter}
//               allowDecimals={false}
//               axisLine={false}
//               tickLine={false}
//               padding={{ top: 0, bottom: 0, left: 0, right: 20 }}
//             />
//           }
//           {includeLegendOrTable && (
//             <Legend
//               content={({ payload }) => {
//                 if (useTableInsteadOfLegend) {
//                   return (
//                     <div className='flex flex-wrap items-center justify-center mt-4 rounded border border-gray-200 max-h-32 overflow-scroll w-full'>
//                       <BarChartTable
//                         valueHeader={valueHeader}
//                         barChartData={data}
//                         getColor={getColorForName}
//                         dateFormatter={dateFormatter}
//                       />
//                     </div>
//                   )
//                 } else {
//                   return (
//                     <div className='flex flex-wrap items-center justify-center gap-2 border border-gray-200 px-4 py-2 mt-4 rounded max-h-24 overflow-scroll'>
//                       {payload.map((entry, index) => (
//                         <div key={index} className='inline-flex items-center justify-center w-fit rounded-md transition-all px-2 py-1'>
//                           <div className='transition-all rounded-full h-2 w-2 mr-2' style={{ backgroundColor: entry.color }} />
//                           <span className='transition-all text-xs text-gray-700'>
//                             {valueFormatter(entry.value)}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )
//                 }
//               }}
//             />
//           )}
//           <Tooltip
//             isAnimationActive={false}
//             content={
//               <CustomTooltip
//                 dateFormatter={dateFormatter}
//                 getColorForName={getColorForName}
//                 yAxisFormatter={yAxisFormatter}
//                 xAxisKey={xAxisKey}
//               />
//             }
//             allowEscapeViewBox={{ x: false, y: true }}
//             wrapperStyle={{ outline: "none", zIndex: 1000 }}
//           />
//           {uniqueKeys.map((key, i, arr) => {
//             return (
//               <Bar
//                 key={i}
//                 dataKey={key}
//                 stackId='a'
//                 fill={getColorForName(key)}
//               />
//             )
//           })}
//         </BarChart>
//       </ResponsiveContainer>
//     )
// )

// export default function BarChartComponent({
//   className,
//   colors = DEFAULT_COLORS,
//   colorsByKey = {},
//   dataVisualizationId,
//   data,
//   groupedBy,
//   height = 'h-96',
//   includeCard = true,
//   includeSettingsDropdown = true,
//   isEnlargable = true,
//   noDataMessage = 'No data available.',
//   QueryDetails,
//   showGridLines = true,
//   showLegend = true,
//   showXAxis = true,
//   showYAxis = true,
//   showTableInsteadOfLegend = false,
//   stackOffset = 'none',
//   subtitle,
//   title,
//   valueHeader,
//   valueFormatter = val => val,
//   yAxisFormatter = val => val,
//   xAxisKey = 'date',
// }) {
//   const [includeXAxis, setIncludeXAxis] = useState(showXAxis);
//   const [includeYAxis, setIncludeYAxis] = useState(showYAxis);
//   const [includeGridLines, setIncludeGridLines] = useState(showGridLines);
//   const [includeLegendOrTable, setIncludeLegendOrTable] = useState(showLegend);
//   const [useTableInsteadOfLegend, setUseTableInsteadOfLegend] = useState(showTableInsteadOfLegend);
//   const colorDict = useRef({});

//   useEffect(() => {
//     setIncludeXAxis(showXAxis);
//     setIncludeYAxis(showYAxis);
//     setIncludeGridLines(showGridLines);
//     setIncludeLegendOrTable(showLegend);
//     setUseTableInsteadOfLegend(showTableInsteadOfLegend);
//   }, [showXAxis, showYAxis, showGridLines, showLegend, showTableInsteadOfLegend])

//   const dateFormatter = dateFormatterForGrouping(groupedBy)

//   let uniqueKeys = [...new Set((data || []).flatMap(Object.keys))].filter(key => key !== xAxisKey);
//   if (uniqueKeys.length > 50) {
//     console.error('BarChart can only accept up to 50 unique keys.');
//     uniqueKeys = uniqueKeys.slice(0, 50)
//   }

//   let colorsToChooseFrom = [...colors];
//   const getColorForName = name => {
//     if (!colorDict.current[name]) {
//       colorDict.current[name] = colorsByKey[name] || colorsToChooseFrom.shift();
//     }
//     return colorDict.current[name];
//   }

//   console.log('BarChart includeSettingsDropdown', includeSettingsDropdown)

//   return (
//     <ConditionalCardWrapper
//       className={className}
//       dataVisualizationId={dataVisualizationId}
//       includeCard={includeCard}
//       includeSettingsDropdown={includeSettingsDropdown}
//       isEnlargable={isEnlargable}
//       loading={data === null || data === undefined}
//       QueryDetails={QueryDetails}
//       settings={[
//         { onChange: setIncludeYAxis, label: 'Include Y-Axis', enabled: includeYAxis },
//         { onChange: setIncludeXAxis, label: 'Include X-Axis', enabled: includeXAxis },
//         { onChange: setIncludeGridLines, label: 'Include Grid Lines', enabled: includeGridLines },
//         {
//           label: 'Legend Display',
//           onChange: v => {
//             if (v === 'none') {
//               setIncludeLegendOrTable(false)
//             } else {
//               setIncludeLegendOrTable(true)
//               if (v === 'table') {
//                 setUseTableInsteadOfLegend(true)
//               } else {
//                 setUseTableInsteadOfLegend(false)
//               }
//             }
//           },
//           options: [
//             { label: 'None', value: 'none', enabled: !includeLegendOrTable },
//             { label: 'Table', value: 'table', enabled: includeLegendOrTable && useTableInsteadOfLegend },
//             { label: 'Legend', value: 'legend', enabled: includeLegendOrTable && !useTableInsteadOfLegend },
//           ]
//         }
//       ]}
//       title={title}
//       subtitle={subtitle}
//     >
//       <BarChartContent
//         data={data}
//         dateFormatter={dateFormatter}
//         getColorForName={getColorForName}
//         height={height}
//         includeGridLines={includeGridLines}
//         includeLegendOrTable={includeLegendOrTable}
//         includeXAxis={includeXAxis}
//         includeYAxis={includeYAxis}
//         noDataMessage={noDataMessage}
//         stackOffset={stackOffset}
//         valueHeader={valueHeader}
//         uniqueKeys={uniqueKeys}
//         useTableInsteadOfLegend={useTableInsteadOfLegend}
//         valueFormatter={valueFormatter}
//         xAxisKey={xAxisKey}
//         yAxisFormatter={yAxisFormatter}
//       />
//     </ConditionalCardWrapper>
//   )
// }
