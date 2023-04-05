import { useState } from 'react';
import { PieChart, Legend, Pie, Sector, Cell } from 'recharts';
import { Tokens } from '.mirrorful/theme_cjs';


const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const RADIAN = Math.PI / 180;
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
      <text className="text-3xl" x={cx} y={cy} dx={4} dy={10} textAnchor="middle" fill={fill}>
        {payload.value}%
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
    </g>
  );
};

const CwvBadge = ({metric, cwv}) => {
  if(!metric) {return <></>} 
  
  const metricScore = calcCwvMetric(metric, cwv);
  let colorBg = 'bg-red-100';; 
  let colorText = 'text-red-800';
  if(metricScore.rating === 'pass') {
    colorBg = 'bg-green-100';
    colorText = 'text-green-800';
  }
  if(metricScore.rating === 'average') {
    colorBg = 'bg-yellow-100';
    colorText = 'text-yellow-800';
  }
  return (
    <span className={`inline-flex rounded-full ${colorBg} ${colorText} px-2 text-xs font-semibold leading-5`}>
      {metricFormatterPlusUnits(metric, metricScore.metricScoring.displayUnits || '')} 
    </span> 
  );
}

export default function DemographicsCard({ title }) {
  const [currentQuadrant, setCurrentQuadrant] = useState(0);
  const roundedScore = Math.ceil(76)

  const COLORS = [Tokens.colors.red.base, Tokens.colors.blue.base, Tokens.colors.green.base];

  const onPieEnter = (_, index) => {
    console.log('pie enter', index);
  };
  const handleMouseEnter = (i) => {
    setCurrentQuadrant(i);
  };
  return (
    <div className='rounded-lg border border-gray-200 p-4'>
      <h2 className="text-md font-medium">{title}</h2>
      <PieChart width={300} height={300} className="mx-auto">
        <Pie
          data={[{ name: 'iOS', value: 35 }, { name: 'Android', value: 30 }, { name: 'Macbook', value: 35 }]}
          cx={'50%'}
          cy={'50%'}
          activeIndex={0}
          activeShape={renderActiveShape}
          innerRadius={55}
          outerRadius={65}
          fill="#000"
          paddingAngle={5}
          activeIndex={currentQuadrant}
          dataKey="value"
          onMouseEnter={(_, i) => handleMouseEnter(i)}
        >
          {[{ name: 'iOS', value: 35 }, { name: 'Android', value: 30 }, { name: 'Macbook', value: 35 }].map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" height={24} onMouseEnter={(_, i) => handleMouseEnter(i)} />
      </PieChart>
      <div className="-mx-4 border-t border-gray-200 mt-16">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-bold text-gray-500">{title}</dt>
            <dt className="text-sm font-bold text-gray-500">Web Vital</dt>
            <dt className="text-sm font-bold text-gray-500">Score</dt>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">iOS</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              FCP
            </dd>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              <span className={`inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold leading-5`}>95</span>
            </dd>
            <dt className="text-sm font-medium text-gray-500"></dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              CLS
            </dd>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              <span className={`inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold leading-5`}>76</span>
            </dd>
            <dt className="text-sm font-medium text-gray-500"></dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              FID
            </dd>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              <span className={`inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold leading-5`}>76</span>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Mobile</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              FCP
            </dd>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              <span className={`inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold leading-5`}>95</span>
            </dd>
            <dt className="text-sm font-medium text-gray-500"></dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              CLS
            </dd>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              <span className={`inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold leading-5`}>76</span>
            </dd>
            <dt className="text-sm font-medium text-gray-500"></dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              FID
            </dd>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
              <span className={`inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold leading-5`}>76</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}