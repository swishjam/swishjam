import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function PieChartComponent({ 
  title, 
  data, 
  width = 600,
  height = 300,
  cx = 120, 
  cy = 200, 
  innerRadius = 60, 
  outerRadius = 80, 
  paddingAngle = 5,
  sizeMultiplier = 1
}) {
  console.log(data);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <ResponsiveContainer width="100%" aspect={3}> */}
          <PieChart width={width * sizeMultiplier} height={height * sizeMultiplier}>
            <Pie
              data={data}
              cx={cx * sizeMultiplier}
              cy={cy * sizeMultiplier}
              innerRadius={innerRadius * sizeMultiplier}
              outerRadius={outerRadius * sizeMultiplier}
              fill="#8884d8"
              paddingAngle={paddingAngle * sizeMultiplier}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        {/* </ResponsiveContainer> */}
      </CardContent>
    </Card>
  );
}
