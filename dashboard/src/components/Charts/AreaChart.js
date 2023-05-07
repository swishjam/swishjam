import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SwishjamAreaChart({
  data,
  xAxisKey,
  keys,
  height = 'h-72',
  width = 'w-96',
  yAxisDataFormatter = val => val,
  xAxisDataFormatter = val => val,
  includeLegend = true
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white w-fit py-4 px-8 relative border border-gray-300 rounded-lg min-w-72 focus:ring-0">
          <div className='w-full mb-2'>
            <span className="text-xs text-gray-400 right-0 top-0">{label}</span>
          </div>
          <h3 className={`text-2xl font-bold text-gray-700 flex items-center`}>
            {yAxisDataFormatter(payload[0].value)}
          </h3>
        </div>
      );
    }
  };

  const formattedData = data.map(datum => {
    return {
      ...datum,
      [xAxisKey]: xAxisDataFormatter(datum[xAxisKey])
    }
  });

  return (
    <div className={`${width} ${height}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={750}
          height={250}
          data={formattedData}
          margin={{
            top: 5,
            // right: 30,
            // left: 20,
            bottom: 5,
          }}
        >
          <defs>
            {keys.map(key => (
              <linearGradient id={`${key}Color`} x1="0" y1="0" x2="0" y2="1" key={key}>
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: '10px', color: 'darkgrey' }} />
          <YAxis tick={{ fontSize: '10px', color: 'darkgrey' }} tickFormatter={yAxisDataFormatter} />
          <Tooltip content={<CustomTooltip />} />
          {includeLegend && <Legend />}
          {keys.map(key => (
            <Area type="monotone" dataKey={key} stroke="#8884d8" fillOpacity={1} fill={`url(#${key}Color)`} key={key} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
