import { Input } from "@/components/ui/input";
import { RadioGroupItems } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch";

const COLOR_OPTIONS = [
  // { color: '#7dd3fc', fill: '#E2E8F0' },
  { color: '#7dd3fc', fill: '#bde7fd' },
  { color: '#878b90', fill: "#bfc3ca" },
  { color: '#ff0422', fill: '#FDE8E8' },
  { color: '#F5A623', fill: '#FFF6E5' },
  { color: '#F8E71C', fill: '#FFFAE5' },
  { color: '#cb8447', fill: '#FDF5E8' },
  { color: '#7ED321', fill: '#E9F7E1' },
  { color: '#417505', fill: '#F0F7E9' },
  { color: '#BD10E0', fill: '#F9E9FA' },
  { color: '#9013FE', fill: '#F9E9FA' },
  { color: '#4A90E2', fill: '#E9F7FE' },
  { color: '#50E3C2', fill: '#E9FDF6' },
  { color: '#B8E986', fill: '#F0FAE9' },
  { color: '#4A4A4A', fill: '#F2F2F2' },
]

export default function AreaChartAdditionalSettings({
  onConfigurationChange,
  valueFormatter = 'number',
  includeComparisonData = true,
  includeTable,
  primaryColor,
  secondaryColor,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  xAxisTitle,
  yAxisTitle,
}) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>X-Axis Title</h2>
          <h3 className='text-xs text-gray-500'>Optionally include a title to display along the x-axis.</h3>
        </div>
        <div className='flex items-center'>
          <Input
            className='w-3/4'
            placeholder='Your x-axis title'
            value={xAxisTitle}
            onChange={e => onConfigurationChange({ xAxisTitle: e.target.value })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Y-Axis Title</h2>
          <h3 className='text-xs text-gray-500'>Optionally include a title to display along the y-axis.</h3>
        </div>
        <div className='flex items-center'>
          <Input
            className='w-3/4'
            placeholder='Your y-axis title'
            value={yAxisTitle}
            onChange={e => onConfigurationChange({ yAxisTitle: e.target.value })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Number Formatter</h2>
          <h3 className='text-xs text-gray-500'>Determines how the displayed numbers are formatted within the visualization.</h3>
        </div>
        <div className='flex items-center'>
          <RadioGroupItems
            direction='horizontal'
            items={['number', 'currency', 'percent']}
            selected={valueFormatter}
            onSelect={valueFormatter => onConfigurationChange({ valueFormatter })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Primary Data Colors</h2>
          <h3 className='text-xs text-gray-500'>Select which color you'd like the primary data area to be displayed in.</h3>
        </div>
        <div className='flex space-x-2'>
          {COLOR_OPTIONS.map(({ color, fill }) => (
            <div
              key={color}
              className={`cursor-pointer w-6 h-6 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 ${primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              onClick={() => onConfigurationChange({ primaryColor: color, primaryColorFill: fill })}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 relative'>
        {!includeComparisonData && (
          <div className='absolute cursor-not-allowed -top-4 left-0 bottom-0 w-full bg-white bg-opacity-80 flex items-center justify-center' />
        )}
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Comparison Data Colors</h2>
          <h3 className='text-xs text-gray-500'>Select which color you'd like the comparison data area to be displayed in.</h3>
        </div>
        <div className='flex space-x-2'>
          {COLOR_OPTIONS.map(({ color, fill }) => (
            <div
              key={color}
              className={`cursor-pointer w-6 h-6 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 ${includeComparisonData && secondaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              onClick={() => onConfigurationChange({ secondaryColor: color, secondaryColorFill: fill })}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Include Comparison Data</h2>
          <h3 className='text-xs text-gray-500'>Whether or not to include a secondary area viz within the graph to show the previous period's data. This can be overridden after the initial render by the chart viewer.</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={includeComparisonData}
            onCheckedChange={checked => onConfigurationChange({ includeComparisonData: checked })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Include Table Display</h2>
          <h3 className='text-xs text-gray-500'>Optionally enable/disable showing the data in a table format below the chart.</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={includeTable}
            onCheckedChange={checked => onConfigurationChange({ includeTable: checked })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Include Y-Axis</h2>
          <h3 className='text-xs text-gray-500'>Enable/disable rendering the y-axis by default. This can be overridden after the initial render by the chart viewer.</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={showYAxis}
            onCheckedChange={checked => onConfigurationChange({ showYAxis: checked })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Include X-Axis</h2>
          <h3 className='text-xs text-gray-500'>Enable/disable rendering the x-axis by default. This can be overridden after the initial render by the chart viewer.</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={showXAxis}
            onCheckedChange={checked => onConfigurationChange({ showXAxis: checked })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Display Grid Lines</h2>
          <h3 className='text-xs text-gray-500'>Enable/disable rendering the grid lines by default. This can be overridden after the initial render by the chart viewer.</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={showGridLines}
            onCheckedChange={checked => onConfigurationChange({ showGridLines: checked })}
          />
        </div>
      </div>
    </div>
  )
}