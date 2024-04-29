import { Input } from "@/components/ui/input";
import { RadioGroupItems } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useState } from "react";

export default function BarChartAdditionalSettings({
  onConfigurationChange,
  emptyValuePlaceholder = 'EMPTY',
  excludeEmptyValues = false,
  maxRankingToNotBeConsideredOther = 10,
  showGridLines = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showTableInsteadOfLegend = true,
}) {
  const [visibleEmptyValuePlaceholderValue, setVisibleEmptyValuePlaceholderValue] = useDebouncedValue(
    useState(emptyValuePlaceholder),
    v => onConfigurationChange({ emptyValuePlaceholder: v })
  )

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Default Legend Type</h2>
          <h3 className='text-xs text-gray-500'>Choose how this chart will render the default legend type. This can be overridden after the initial render by the chart viewer.</h3>
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
          <h2 className='text-sm font-medium text-gray-800'>Bucket into "Other" after <span className='font-medium italic'>n</span> unique values</h2>
          <h3 className='text-xs text-gray-500'>If there are more than <span className='font-medium italic'>n</span> unique values for your query, bucket the rest into the "Other" category. Default is 10.</h3>
        </div>
        <div className='flex items-center'>
          <Input
            className='w-fit'
            type='number'
            min={1}
            max={20}
            onChange={e => onConfigurationChange({ maxRankingToNotBeConsideredOther: e.target.value })}
            value={maxRankingToNotBeConsideredOther}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Exclude Empty Values</h2>
          <h3 className='text-xs text-gray-500'>When enabled, events that don't possess the specified property will be filtered out from the visualization entirely. If disabled, the results will contain empty values for these events (when applicable).</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={excludeEmptyValues}
            onCheckedChange={checked => onConfigurationChange({ excludeEmptyValues: checked })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 relative'>
        {excludeEmptyValues && (
          <div className='absolute cursor-not-allowed -top-4 left-0 bottom-0 w-full bg-white bg-opacity-80 flex items-center justify-center' />
        )}
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Empty value placeholder</h2>
          <h3 className='text-xs text-gray-500'>When an event does not possess the specified property, display this value instead.</h3>
        </div>
        <div className='flex items-center'>
          <Input
            className='w-fit'
            type='text'
            onChange={e => setVisibleEmptyValuePlaceholderValue(e.target.value)}
            value={excludeEmptyValues ? '' : visibleEmptyValuePlaceholderValue}
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