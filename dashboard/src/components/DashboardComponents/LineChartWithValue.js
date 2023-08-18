"use client"

import { LineChart, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { CircleIcon } from "@radix-ui/react-icons"

const LoadingView = ({ title }) => (
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

const CustomTooltip = ({ active, payload, label, formatter }) => {
  // console.log('payload', payload) 
  if (active && payload && payload.length) {
    let data = payload[0].payload; 
    
    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CircleIcon className="mr-1 h-3 w-3 fill-swishjam text-swishjam" />
              {formatter(data.value)} - {new Date(data.date).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric"})}
            </div>
          </div>
          {data.comparisonValue && 
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CircleIcon className="mr-1 h-3 w-3 fill-slate-200 text-slate-200" />
                {formatter(data.comparisonValue)} - {new Date(data.comparisonDate).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric"})}
              </div>
            </div>
          }
        </CardContent>
      </Card>
    );
  }
  return null;
}

export default function LineChartWithValue({ title, value, previousValue, previousValueDate, timeseries, formatter = val => val }) {
  if (!value || !timeseries) return <LoadingView title={title} />;

  const changeInValue = typeof previousValue !== 'undefined' ? value - previousValue : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold cursor-default">
          <span>{formatter(value)}</span>
        </div>
        {changeInValue && changeInValue !== 0 &&
          <HoverCard>
            <HoverCardTrigger>
              <p className="text-xs text-muted-foreground cursor-default">
                {changeInValue < 0 ? <ArrowTrendingDownIcon className="h-4 w-4 inline-block text-red-500 mr-1" /> : <ArrowTrendingUpIcon className="h-4 w-4 inline-block text-green-500 mr-1" />}
                <span className='underline decoration-dotted'>{formatter(Math.abs(changeInValue))}</span>
              </p>
            </HoverCardTrigger>
            <HoverCardContent className='flex items-center text-gray-500'>
              <CalendarIcon className="h-6 w-6 inline-block mr-2" />
              <span className='text-xs'>{title} was measured at {formatter(previousValue)} on {new Date(previousValueDate).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}.</span>
            </HoverCardContent>
          </HoverCard>
        }
        {timeseries.length > 0 &&
          <ResponsiveContainer width="100%" aspect={3} className="mt-4">
            <LineChart
              width={500}
              height={300}
              data={timeseries}
              margin={{
                top: 10,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <Tooltip
                animationBegin={200}
                animationDuration={400}
                wrapperStyle={{ outline: "none" }}
                content={<CustomTooltip formatter={formatter}/>}
                allowEscapeViewBox={{x: false, y: true}}
                animationEasing={'ease-in-out'}
              />
              <Line
                type="natural"
                dataKey='comparisonValue'
                xAxisId='index'
                stroke="#E2E8F0"
                dot={{ r: 0 }}
                activeDot={{ r: 2 }}
                strokeWidth={2}
              />
              <Line
                type="natural"
                dataKey='value'
                xAxisId='index'
                stroke="#7487F7"
                dot={{ r: 0 }}
                activeDot={{ r: 2 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        }
      </CardContent>
    </Card>
  )
}