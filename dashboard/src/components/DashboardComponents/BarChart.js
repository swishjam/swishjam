"use client"

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { CircleIcon } from "@radix-ui/react-icons"
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EmptyState from '@/components/EmptyState';
import { generateUniqueHexColor } from '@/lib/utils/colorHelpers';

const LoadingState = ({ title }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="w-[100px] h-[30px] rounded-sm" />
      <Skeleton className="w-full h-20 rounded-sm mt-1" />
    </CardContent>
  </Card>
)

const SettingsDropdown = ({ includeGridLines, includeXAxis, includeYAxis, onXAxisChange, onYAxisChange, onIncludeGridLinesChange, onSettingChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Cog8ToothIcon className={`group-active:opacity-100 group-focus:opacity-100 group-hover:opacity-100 ring-0 opacity-0 duration-500 transition h-5 w-5 text-gray-500 cursor-pointer`} />
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
    </DropdownMenuContent>
  </DropdownMenu>
)

export default function BarChartComponent({
  title,
  data,
  valueFormatter = val => val,
  dateFormatter = date => new Date(date).toLocaleDateString('en-us', { month: "2-digit", day: "2-digit" }),
  longDateFormatter = date => new Date(date).toLocaleDateString('en-us', { month: "long", day: "2-digit", year: 'numeric' }),
  noDataMessage = 'No data available.',
  xAxisKey = 'date',
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  includeSettingsDropdown = true,
  onSettingChange = () => {},
  height = 'h-96',
  colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFC0CB',
    '#FF4500', '#32CD32', '#00008B', '#FF8C00', '#FF69B4',
    '#DC143C', '#008000', '#0000CD', '#FF7F50', '#FF1493',
    '#B22222', '#006400', '#191970', '#FF6347', '#DB7093',
    '#8B0000', '#228B22', '#483D8B', '#FF4500', '#C71585'
  ],
}) {
  if ([null, undefined].includes(data)) return <LoadingState title={title} />;

  const [includeXAxis, setIncludeXAxis] = useState(showXAxis);
  const [includeYAxis, setIncludeYAxis] = useState(showYAxis);
  const [includeGridLines, setIncludeGridLines] = useState(showGridLines);

  let colorDict = {};
  let colorsToChooseFrom = colors;
  const getColorForName = name => {
    if (!colorDict[name]) {
      colorDict[name] = colorsToChooseFrom.shift() || generateUniqueHexColor();
    }
    return colorDict[name];
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const keysInTooltip = Object.keys(data).filter(key => key !== xAxisKey)

      return (
        <Card className="z-[50000] bg-white">
          <CardContent className="py-2">
            <span className='block text-sm font-medium'>{longDateFormatter(data[xAxisKey])}</span>
            {keysInTooltip.map(key => {
              const color = getColorForName(key);
              return (
                <div key={key}>
                  <div className='h-2 w-2 mr-1 inline' style={{ background: color }} />
                  <div className='text-xs inline font-medium' style={{ color: color }}>
                    {key}: {valueFormatter(data[key])}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const uniqueKeys = [...new Set(data.flatMap(Object.keys))].filter(key => key !== xAxisKey);

  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
        {includeSettingsDropdown && (
          <SettingsDropdown
            includeGridLines={includeGridLines}
            includeXAxis={includeXAxis}
            includeYAxis={includeYAxis}
            onYAxisChange={setIncludeYAxis}
            onXAxisChange={setIncludeXAxis}
            onIncludeGridLinesChange={setIncludeGridLines}
            onSettingChange={onSettingChange}
          />
        )}
      </CardHeader>
      <CardContent>
        {data.length > 0
          ? (
            <div className={`flex align-center justify-center my-6 ${height}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  {includeGridLines && <CartesianGrid strokeDasharray="4 4" vertical={false} opacity={0.75} />}
                  {includeXAxis && <XAxis dataKey={xAxisKey} tickFormatter={dateFormatter} angle={0} height={100} tick={{ fontSize: '12px' }} />}
                  {includeYAxis && <YAxis tick={{ fontSize: '12px' }} tickFormatter={valueFormatter} />}
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
          ) : <EmptyState msg={noDataMessage} />
        }
      </CardContent>
    </Card>
  )
}