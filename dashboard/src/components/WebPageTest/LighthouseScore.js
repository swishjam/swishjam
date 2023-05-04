import { PieChart, Pie, Sector, Cell } from 'recharts';

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, size, sizeMultiplier } = props;
  const textSize = {
    large: 'text-5xl',
    medium: 'text-3xl',
    small: 'text-lg',
    tiny: 'text-xs'
  }[size]
  return (
    <g>
      <text className={textSize} x={cx} y={cy} dy={16 * sizeMultiplier} textAnchor="middle" fill={fill}>
        {payload.value}
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
    </g>
  );
};

export default function LighthouseScore({ score, size = 'large', centerAligned = true }) {
  if (!['large', 'medium', 'small', 'tiny'].includes(size)) throw new Error('Invalid size prop passed to LighthouseScore component. Valid sizes are: large, medium, small, tiny');
  const sizeMultiplier = {
    large: 1,
    medium: 0.75,
    small: 0.5,
    tiny: 0.25
  }[size];
  const data = [100 - score, score].map(value => ({ value, name: 'Lighthouse Score' }) );
  const COLORS = ['#f1f5f9', (score >= 90 ? '#10b981' : (score >= 50 ? '#eab308' : '#f43f5e'))];

  return (
    <PieChart width={200 * sizeMultiplier} height={200 * sizeMultiplier} className={`${centerAligned ? "mx-auto" : ''}`}>
      <Pie
        data={data}
        cx={'50%'}
        cy={'50%'}
        activeIndex={1}
        activeShape={props => renderActiveShape({ ...props, size, sizeMultiplier })}
        innerRadius={66 * sizeMultiplier}
        outerRadius={75 * sizeMultiplier}
        fill="#000"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}