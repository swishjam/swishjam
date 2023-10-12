import { useState } from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Legend } from 'recharts';
import ConditionalCardWrapper from './ConditionalCardWrapper';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {value}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function PieChartComponent({
  title,
  data,
  valueKey = 'value',
  width = 400,
  // height = 400,
  innerRadius = 60,
  outerRadius = 80,
  paddingAngle = 5,
  sizeMultiplier = 1,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  includeLegend = false,
  includeTooltips = true,
  includeCard = true,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const height = width * 0.75;
  return (
    <ConditionalCardWrapper title={title} includeCard={includeCard}>
      <ResponsiveContainer width="100%" height={height + 25}>
        <PieChart width={width * sizeMultiplier} height={height * sizeMultiplier}>
          <Pie
            data={data}
            cx={width / 2}
            cy={height / 2}
            innerRadius={innerRadius * sizeMultiplier}
            outerRadius={outerRadius * sizeMultiplier}
            fill="#8884d8"
            paddingAngle={paddingAngle * sizeMultiplier}
            dataKey={valueKey}
            activeIndex={includeTooltips ? activeIndex : null}
            onMouseEnter={(_, i) => includeTooltips && setActiveIndex(i)}
            activeShape={props => includeTooltips && renderActiveShape(props)}
          >
            {data
              ? data.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)
              : Array.from({ length: 4 }).map((_, index) => <Cell key={`cell-${index}`} fill='lightgrey' />)
            }
          </Pie>
          {includeLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </ConditionalCardWrapper>
  );
}
