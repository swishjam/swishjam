import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label, Tooltip } from 'recharts';
import defineComponentAsDataVisualization from './DataVisualizationWrapper';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 shadow-xl rounded-md px-4 py-2 text-sm text-gray-700 flex items-center">
        <div className='w-2 h-2 rounded-full mr-2' style={{ backgroundColor: payload[0].payload.fill }} />
        <span>{payload[0].name}: {payload[0].value}</span>
      </div>
    );
  }

  return null;
};

const PieChartVisualization = ({
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19FF19', '#1919FF', '#FF19FF', '#19FFFF', '#FFFF19'],
  data,
  dataKey = 'value',
  includeLegend = true,
  innerRadius = 60,
  includeTooltips = true,
  nameKey = 'name',
  outerRadius = 80,
  pieType = 'donut',
  spaceBetweenSlices = 5,
}) => {
  const [activeIndex, setActiveIndex] = useState();
  const [disabledValues, setDisabledValues] = useState([]);
  // const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // const containerRef = useRef();

  // useEffect(() => {
  //   if (containerRef.current) {
  //     const { width, height } = containerRef.current.getBoundingClientRect();
  //     setContainerSize({ width, height });
  //   }
  // }, []);

  // const minSize = Math.min(containerSize.width, containerSize.height);
  // const adjustedInnerRadius = (minSize / 2) * (innerRadius / 100);
  // const adjustedOuterRadius = (minSize / 2) * (outerRadius / 100);

  return (
    <>
      <ResponsiveContainer width='100%'>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            cx='50%'
            cy='50%'
            data={data.filter(d => !disabledValues.includes(d[nameKey]))}
            innerRadius={pieType === 'donut' ? 80 : 0}
            outerRadius={100}
            // innerRadius={adjustedInnerRadius}
            // outerRadius={adjustedOuterRadius}
            paddingAngle={spaceBetweenSlices}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => {
              if (!disabledValues.includes(entry[nameKey])) {
                return (
                  <Cell
                    key={index}
                    fill={colors[index % colors.length]}
                    opacity={index === activeIndex ? 1 : 0.75}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex()}
                    className='transition duration-300 !outline-none'
                  />
                )
              }
            })}
            {activeIndex !== undefined && (
              <Label
                value={`${data[activeIndex][nameKey]}: ${data[activeIndex][dataKey]}`}
                position="center"
                className='text-sm text-gray-700'
              />
            )}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className='px-4 py-2 rounded-sm border border-gray-200 flex space-x-2 flex-wrap justify-center'>
        {data.map((entry, index) => {
          const value = entry[nameKey];
          const isDisabled = disabledValues.includes(value);
          const color = colors[index % colors.length];
          return (
            <div
              key={index}
              className={`flex items-center px-2 py-1 rounded mt-1 transition duration-300 cursor-pointer ${isDisabled ? 'bg-gray-200 hover:bg-white' : 'hover:bg-gray-100'}`}
              onClick={() => setDisabledValues(isDisabled ? disabledValues.filter(v => v !== value) : [...disabledValues, value])}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex()}
            // onMouseEnter={() => setHighlightedValue(value)}
            // onMouseLeave={() => setHighlightedValue()}
            >
              <div className='w-2 h-2 rounded-full mr-2' style={{ backgroundColor: isDisabled ? 'grey' : color }} />
              <span className='text-gray-700 text-xs'>{value}</span>
            </div>
          )
        })}
      </div>
    </>
  );

  // return (
  //   <ResponsiveContainer width="100%" height={height + 25}>
  //     <PieChart width={width * sizeMultiplier} height={height * sizeMultiplier}>
  //       <Pie
  //         activeIndex={includeTooltips ? activeIndex : null}
  //         activeShape={props => includeTooltips && renderActiveShape(props)}
  //         cx={width / 2}
  //         cy={height / 2}
  //         data={data}
  //         dataKey={dataKey}
  //         fill="#8884d8"
  //         innerRadius={innerRadius * sizeMultiplier}
  //         nameKey={nameKey}
  //         onMouseEnter={(_, i) => includeTooltips && setActiveIndex(i)}
  //         outerRadius={outerRadius * sizeMultiplier}
  //         paddingAngle={paddingAngle * sizeMultiplier}
  //       >
  //         {data
  //           ? data.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)
  //           : Array.from({ length: 4 }).map((_, index) => <Cell key={`cell-${index}`} fill='lightgrey' />)
  //         }
  //       </Pie>
  //       {includeLegend && <Legend />}
  //     </PieChart>
  //   </ResponsiveContainer>
  // );
}

export default defineComponentAsDataVisualization(PieChartVisualization)