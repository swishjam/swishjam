import { RadioGroupItems } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch";

export default function BarChartAdditionalSettings({
  onConfigurationChange,
  showGridLines = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showTableInsteadOfLegend = true,
}) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Number Formatter</h2>
          <h3 className='text-xs text-gray-500'>Determines how the displayed numbers are formatted within the visualization.</h3>
        </div>
        <div className='flex items-center'>
          <RadioGroupItems
            direction='horizontal'
            items={['table', 'legend', 'none']}
            selected={showLegend ? (showTableInsteadOfLegend ? 'table' : 'legend') : 'none'}
            onSelect={value => {
              if (value === 'none') {
                onConfigurationChange({ showLegend: false })
              } else if (value === 'table') {
                onConfigurationChange({ showLegend: true, showTableInsteadOfLegend: true })
              } else {
                onConfigurationChange({ showLegend: true, showTableInsteadOfLegend: false })
              }
            }}
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