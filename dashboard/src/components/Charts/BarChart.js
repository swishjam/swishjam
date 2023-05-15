import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts"

const defaultTooltipDisplay = ({ payload, label, colors, hideTooltipNames, yAxisDataFormatter, yAxisNameFormatter, tooltipDescriptionFormatter }) => (
  <div className="custom-tooltip bg-white w-fit p-4 relative border border-gray-300 rounded-lg min-w-72">
    <div className='w-full mb-2'>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
    {payload.map(({ name, value }, i) => (
      !hideTooltipNames.includes(name) && (
        <div className='flex justify-between items-center' key={i}>
          <div className='text-xs text-gray-700 inline-flex items-center font-bold'>
            <div className='inline-block w-2 h-2 mr-2 rounded-full' style={{ backgroundColor: colors[i] }} />
            {yAxisDataFormatter(value)}
          </div>
          <div className={`text-xs text-gray-700 flex items-center justify-end ml-4`}>
            {yAxisNameFormatter(name)}
          </div>
        </div>
      )
    ))}
    <div className='text-center text-gray-400 mt-2 text-center' style={{ fontSize: '0.6rem' }}>
      {tooltipDescriptionFormatter(label)}
    </div>
  </div>
)

export default function SwishjamBarChart({ 
  data, 
  xAxisKey,
  keys,
  colors,
  stacked = false,
  xAxisDataFormatter = val => val,
  yAxisDataFormatter = val => val,
  yAxisNameFormatter = val => val,
  tooltipDescriptionFormatter = val => val,
  tooltipDisplay = defaultTooltipDisplay,
  hideTooltipNames = [],
  yAxisTickFormatter,
  height = 'h-72', 
  yAxisMin,
  yAxisMax,
  yAxisIncrements,
  includeYAxis = true,
  includeLegend = true 
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return tooltipDisplay({ payload, label, colors, hideTooltipNames, yAxisDataFormatter, yAxisNameFormatter, tooltipDescriptionFormatter }) || defaultTooltipDisplay({ payload, label, colors, hideTooltipNames, yAxisDataFormatter, yAxisNameFormatter, tooltipDescriptionFormatter });
    }
  }

  const formattedData = data.map(datum => ({
    ...datum,
    [xAxisKey]: xAxisDataFormatter(datum[xAxisKey])
  }));

  const explicitYAxis = typeof yAxisMin === 'number' && typeof yAxisMax === 'number' 
                          ? [...Array.from({ length: (yAxisMax - yAxisMin) / (yAxisIncrements || 20) }).map((_, i) => yAxisMin + (i * (yAxisIncrements || 20))), yAxisMax]
                          : undefined;

  return (
    <div className={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ left: 0, top: 0, right: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: '10px', color: 'darkgrey' }} />
          {typeof yAxisMin === 'number' && typeof yAxisMax === 'number'
            ? <YAxis domain={[yAxisMin, yAxisMax]} hide={!includeYAxis} ticks={explicitYAxis} width={35} tick={{ fontSize: '10px', color: 'darkgrey' }} tickFormatter={yAxisTickFormatter || yAxisDataFormatter} />
            : <YAxis hide={!includeYAxis} tick={{ fontSize: '10px', color: 'darkgrey' }} tickFormatter={yAxisTickFormatter || yAxisDataFormatter} />}
          <Tooltip content={<CustomTooltip />} wrapperClassName='border border-gray-300' />
          {includeLegend && <Legend />}
          {keys.map((key, i) => {
            if (stacked) {
              return <Bar dataKey={key} fill={colors[i]} stackId='stack' key={i} />;
            } else {
              return <Bar dataKey={key} fill={colors[i]} key={i} />;
            }
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}