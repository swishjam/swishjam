import { Input } from "@/components/ui/input"
import { RadioGroupItems } from "@/components/ui/radio-group"

export default function PieChartAdditionalSettings({
  onConfigChange,
  pieType = 'donut',
  spaceBetweenSlices = 5,
}) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>PIE TYPE!</h2>
          <h3 className='text-xs text-gray-500'>Choose how this chart will render the default legend type. This can be overridden after the initial render by the chart viewer.</h3>
        </div>
        <div className='flex items-center'>
          <RadioGroupItems
            direction='horizontal'
            items={['donut', 'pie']}
            selected={pieType}
            onSelect={pieType => onConfigChange({ pieType })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='text-sm font-medium text-gray-800'>SPACE BETWEEN SLICES</h2>
          <h3 className='text-xs text-gray-500'>Choose how this chart will render the default legend type. This can be overridden after the initial render by the chart viewer.</h3>
        </div>
        <div className='flex items-center'>
          <Input
            type='number'
            min={0}
            max={10}
            value={spaceBetweenSlices}
            onChange={e => e.target.value ? onConfigChange({ spaceBetweenSlices: parseInt(e.target.value) }) : null}
          />
        </div>
      </div>
    </div>
  )
}