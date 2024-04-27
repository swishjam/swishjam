import { Input } from "@/components/ui/input";
import { RadioGroupItems } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch";

export default function ValueCardAdditionalSettings({
  onConfigurationChange,
  valueFormatter = 'number',
  includeComparisonData = true,
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
            items={['number', 'currency', 'percent']}
            selected={valueFormatter}
            onSelect={valueFormatter => onConfigurationChange({ valueFormatter })}
          />
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
    </div>
  )
}