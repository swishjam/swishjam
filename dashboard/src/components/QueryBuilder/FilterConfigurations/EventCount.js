import Combobox from "@/components/utils/Combobox"
import ComboboxEvents from "@/components/utils/ComboboxEvents"
import { Input } from "@/components/ui/input"

export default function EventCountConfiguration({
  eventCountOperator,
  eventName,
  eventOrPropertyOptions,
  profileType,
  numLookbackDays,
  onConfigChange,
  numOccurrences,
  onEventOrPropertySelect,
  precedingContent,
  succeedingContent,
}) {
  return (
    <div className='text-sm flex items-center space-x-2'>
      {precedingContent}
      <span className='whitespace-nowrap'>
        {profileType.charAt(0).toUpperCase() + profileType.slice(1)}s who have triggered
      </span>
      <ComboboxEvents
        selectedValue={eventName ? `event.${eventName}` : null}
        onSelectionChange={onEventOrPropertySelect}
        options={eventOrPropertyOptions}
        placeholder="Select an event"
      />
      <Combobox
        buttonClass='w-fit'
        selectedValue={eventCountOperator || 'greater_than_or_equal_to'}
        onSelectionChange={selectedValue => onConfigChange({ event_count_operator: selectedValue })}
        options={[
          { label: '>', value: 'greater_than' },
          { label: '<', value: 'less_than' },
          { label: '>=', value: 'greater_than_or_equal_to' },
          { label: '<=', value: 'less_than_or_equal_to' },
        ]}
      />
      <Input
        className='w-20'
        min={0}
        onChange={e => onConfigChange({ num_occurrences: e.target.value === '' ? undefined : parseInt(e.target.value) })}
        placeholder='5'
        type='number'
        value={numOccurrences}
        noRing={true}
      />
      <span className='whitespace-nowrap'>
        times in the last
      </span>
      <Input
        className='w-20'
        min={1}
        onChange={e => onConfigChange({ num_lookback_days: e.target.value === '' ? undefined : parseInt(e.target.value) })}
        placeholder='5'
        type='number'
        value={numLookbackDays}
        noRing={true}
      />
      <span className='whitespace-nowrap'>
        days.
      </span>
      {succeedingContent}
    </div>
  )
}