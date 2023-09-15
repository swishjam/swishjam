import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BarChartComponent({ 
  title, 
  data, 
  includeLegend = true, 
  includeTooltip = true, 
  showXAxis = true,
  showYAxis = true,
  xAxisFormatter = val => val,
  yAxisFormatter = val => val,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" aspect={3}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              className='group-hover:opacity-100 opacity-0 duration-500 transition'
              hide={!showXAxis}
              tickLine={false}
              tickFormatter={xAxisFormatter}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
            />
            <YAxis 
              className='group-hover:opacity-100 opacity-0 duration-500 transition'
              hide={!showYAxis}
              tickLine={false}
              tickFormatter={yAxisFormatter}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
            />
            {includeTooltip && <Tooltip />}
            {includeLegend && <Legend />}
            <Bar dataKey="pv" fill="#8884d8" />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}