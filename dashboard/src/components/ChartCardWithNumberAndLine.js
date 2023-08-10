"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Tooltip, Line, ResponsiveContainer } from 'recharts';

const LoadingView = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>
        <Skeleton className="w-[100px] h-[25px] rounded-sm" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full h-20 rounded-sm" />
    </CardContent>
  </Card>
)

export default function ChartCardWithNumberAndLine({ title, value, valueChange, timeseries }) {

  if(!title || !value)
    return <LoadingView />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {valueChange &&
          <p className="text-xs text-muted-foreground">
            {valueChange} from last month
          </p>
        }
        {timeseries && timeseries.length > 0 &&
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
              allowEscapeViewBox={{x: true, y: true}}
              animationEasing={'ease-in-out'} 
            />
            <Line
              type="natural"
              dataKey='value'
              stroke="#7487F7"
              dot={{ r: 2 }}
              activeDot={{ r: 2 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>}
      </CardContent>
    </Card>
  )
}