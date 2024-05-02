import { RadioGroupItems } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

export default function ValueCardAdditionalSettings({
  onConfigChange,
  valueFormatter = 'number',
  comparisonFormat = 'value',
  textAlignment = 'left',
  increaseFromComparisonValueIsPositive = true,
  resizeValueBasedOnHeight = true,
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
            items={['number', 'percent', 'currency']}
            selected={valueFormatter}
            onSelect={valueFormatter => onConfigChange({ valueFormatter })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Comparison Format</h2>
          <h3 className='text-xs text-gray-500'>Determines the format in which the comparison value is display next to the primary value.</h3>
        </div>
        <div className='flex items-center'>
          <RadioGroupItems
            direction='horizontal'
            items={['number', 'percent', 'none']}
            selected={comparisonFormat}
            onSelect={comparisonFormat => onConfigChange({ comparisonFormat })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Text Alignment</h2>
          <h3 className='text-xs text-gray-500'>Text alignment to display the value within the card.</h3>
        </div>
        <div className='flex items-center'>
          <RadioGroupItems
            direction='horizontal'
            items={['left', 'center', 'right']}
            selected={textAlignment}
            onSelect={textAlignment => onConfigChange({ textAlignment })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 relative'>
        {comparisonFormat === 'none' && (
          <div className='absolute cursor-not-allowed -top-4 left-0 bottom-0 w-full bg-white bg-opacity-80 flex items-center justify-center' />
        )}
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Increase From Comparison Is Positive</h2>
          <h3 className='text-xs text-gray-500'>Determines the color displayed in the up/down trend arrow. If an increase from comparison is positive and the current value is greater than the comparison value, the arrow will be green (ie: a larger churn number is negative, a larger revenue number is positive).</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={comparisonFormat !== 'none' && increaseFromComparisonValueIsPositive}
            onCheckedChange={increaseFromComparisonValueIsPositive => onConfigChange({ increaseFromComparisonValueIsPositive })}
          />
        </div>
      </div>
      {/* <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>Dynamic Font Size</h2>
          <h3 className='text-xs text-gray-500'>When the visualization is resized within a dashboard, the font size will dynamically adjust to fit the new size.</h3>
        </div>
        <div className='flex items-center'>
          <Switch
            checked={resizeValueBasedOnHeight}
            onCheckedChange={resizeValueBasedOnHeight => onConfigChange({ resizeValueBasedOnHeight })}
          />
        </div>
      </div> */}
    </div>
  )
}