import { formattedMsOrSeconds } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MetricChart({ data, metric, goodNeedsImprovementPoorTiers, xAxisKey = 'created_at' }) {
  const maxDataPoint = Math.max(...data.map(i => i[metric]));

  const calculatedPoorCeiling = goodNeedsImprovementPoorTiers.needsImprovement + (goodNeedsImprovementPoorTiers.needsImprovement - goodNeedsImprovementPoorTiers.good);
  const filledInData = data.map(d => ({
    ...d,
    good: goodNeedsImprovementPoorTiers.good,
    needsImprovement: goodNeedsImprovementPoorTiers.needsImprovement,
    poor: maxDataPoint > calculatedPoorCeiling ? maxDataPoint + 10 : calculatedPoorCeiling,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const goodNeedsImprovementPoorStatus = payload[0].payload[metric] < goodNeedsImprovementPoorTiers.good
                                                ? 'good'
                                                : payload[0].payload[metric] < goodNeedsImprovementPoorTiers.needsImprovement
                                                  ? 'needs improvement'
                                                  : 'poor';
      const color = { good: 'green', 'needs improvement': 'yellow', poor: 'red' }[goodNeedsImprovementPoorStatus];
      return (
        <div className="custom-tooltip bg-white w-fit py-4 px-8 relative border border-gray-300 rounded-lg min-w-72 focus:ring-0">
          <div className='w-full mb-2'>
            <span className="text-xs text-gray-400 right-0 top-0">{label}</span>
          </div>
          <h3 className={`text-2xl font-bold text-${color}-600 flex items-center`}>
            {metric === 'Cumulative Layout Shift' ? parseFloat(payload[0].value).toFixed(4) : formattedMsOrSeconds(payload[0].value)}
            <span className={`ml-2 rounded-full text-xs font-normal px-2 py-1 text-${color}-600 bg-${color}-100`}>{goodNeedsImprovementPoorStatus}</span>
          </h3>
        </div>
      );
    }
  };

  return (
    <div className='h-72'>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={filledInData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: '10px', color: 'darkgrey' }} />
          <YAxis 
            domain={[0, maxDataPoint]} 
            tick={{ fontSize: '10px', color: 'darkgrey' }} 
            tickFormatter={val => metric === 'Cumulative Layout Shift' ? parseFloat(val).toFixed(4) : formattedMsOrSeconds(val)}
          />
          <Tooltip content={<CustomTooltip />}/>
          
          <Area type='monotone' dataKey='good' fill="green" stroke="green" strokeWidth={1} opacity={0.15} baseValue={0} />
          {maxDataPoint > goodNeedsImprovementPoorTiers.good && <Area 
            type='monotone' 
            dataKey='needsImprovement'
            fill='yellow' 
            stroke="yellow" 
            strokeWidth={1} 
            opacity={0.15} 
            baseValue={goodNeedsImprovementPoorTiers.good} 
          />}
          {maxDataPoint > goodNeedsImprovementPoorTiers.needsImprovement && <Area 
            type='monotone' 
            dataKey='poor' 
            fill="red" 
            stroke="red" 
            strokeWidth={1} 
            opacity={0.15} 
            baseValue={goodNeedsImprovementPoorTiers.needsImprovement} 
          />}
          <Area type="monotone" data={data} dot={true} dataKey={metric} stroke="#7384ff" fill="#7384ff" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}