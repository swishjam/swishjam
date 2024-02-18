import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"
import Combobox from "@/components/utils/Combobox"
import { Input } from "@/components/ui/input"
import { SparklesIcon, UserCircleIcon } from "lucide-react"
import { useState } from "react"
import { LuTrash } from "react-icons/lu"

export default function UserSegmentFilterConfiguration({
  className,
  displayAndOrButtons,
  displayDeleteButton,
  onNewFilterClick,
  onDelete,
  onUpdate,
  operator,
  uniqueUserProperties,
  uniqueEvents,
}) {
  const [segmentConfig, setSegmentConfig] = useState({})

  const updateSelectedUserPropertyOrEventName = selectedValue => {
    const newConfig = { ...segmentConfig }
    const objectType = selectedValue.split('.')[0]
    newConfig.object_type = objectType
    if (objectType === "event") {
      delete newConfig.user_property_name
      delete newConfig.user_property_operator
      delete newConfig.user_property_value
      newConfig.event_name = selectedValue.split('.').slice(1).join('.')
    } else if (objectType === "user") {
      delete newConfig.event_name
      delete newConfig.num_event_occurrences
      delete newConfig.num_lookback_days
      if (!newConfig.user_property_operator) {
        newConfig.user_property_operator = 'equals'
      }
      newConfig.user_property_name = selectedValue.split('.').slice(1).join('.')
    }
    setSegmentConfig(newConfig)
    onUpdate(newConfig)
  }

  const formattedUserPropertyOptions = uniqueUserProperties.map(option => ({ label: option, value: `user.${option}` }))
  const formattedEventPropertyOptions = uniqueEvents.map(option => ({ label: option, value: `event.${option}` }))

  const isComplete = segmentConfig.object_type === 'user'
    ? segmentConfig.user_property_name && segmentConfig.user_property_operator && (segmentConfig.user_property_operator === "is_defined" || segmentConfig.user_property_operator === "is_not_defined" || segmentConfig.user_property_value)
    : segmentConfig.event_name && segmentConfig.num_event_occurrences && segmentConfig.num_lookback_days;

  return (
    <div className={`flex text-sm items-center space-x-2 ${className}`}>
      <span>
        {!operator
          ? 'Users '
          : (
            <>
              <Badge variant='secondary' className='w-fit py-1 px-2 text-sm bg-green-100 text-green-500 ring-green-600/20 cursor-default transition-colors hover:bg-green-200'>
                {operator.toUpperCase()}
              </Badge> users{' '}
            </>
          )}
        who
        {segmentConfig.object_type === "user" ? "'s " : " have triggered the "}
      </span>
      <Combobox
        selectedValue={segmentConfig.user_property_name ? `user.${segmentConfig.user_property_name}` : segmentConfig.event_name ? `event.${segmentConfig.event_name}` : null}
        onSelectionChange={updateSelectedUserPropertyOrEventName}
        options={[
          { type: "title", label: <div className='flex items-center'><UserCircleIcon className='h-4 w-4 mr-1' /> User Properties</div> },
          ...formattedUserPropertyOptions,
          { type: "separator" },
          { type: "title", label: <div className='flex items-center'><SparklesIcon className='h-4 w-4 mr-1' /> Events</div> },
          ...formattedEventPropertyOptions,
        ]}
        placeholder="Select a property"
      />
      {segmentConfig.object_type === "user" && (
        <>
          <span>
            property
          </span>
          <Combobox
            selectedValue={segmentConfig.user_property_operator}
            onSelectionChange={selectedValue => {
              const newConfig = { ...segmentConfig, user_property_operator: selectedValue }
              setSegmentConfig(newConfig)
              onUpdate(newConfig)
            }}
            options={[
              { label: "equals", value: "equals" },
              { label: "does not equal", value: "does_not_equal" },
              { label: "contains", value: "contains" },
              { label: "does not contain", value: "does_not_contain" },
              { label: 'is defined', value: 'is_defined' },
              { label: 'is not defined', value: 'is_not_defined' },
              { label: "greater than", value: "greater_than" },
              { label: "less than", value: "less_than" },
              { label: "greater than or equal to", value: "greater_than_or_equal_to" },
              { label: "less than or equal to", value: "less_than_or_equal_to" },
            ]}
          />
          {segmentConfig.user_property_operator !== "is_defined" && segmentConfig.user_property_operator !== "is_not_defined" && (
            <Input
              className='w-fit max-w-[200px]'
              type='text'
              placeholder='Property value'
              value={segmentConfig.user_property_value}
              onChange={e => {
                const newConfig = { ...segmentConfig, user_property_value: e.target.value }
                setSegmentConfig(newConfig)
                onUpdate(newConfig)
              }}
            />
          )}
        </>
      )}
      {segmentConfig.object_type === "event" && (
        <>
          <span>
            event
          </span>
          <Input
            className='w-20'
            min={1}
            onChange={e => {
              const newConfig = { ...segmentConfig, num_event_occurrences: parseInt(e.target.value) }
              setSegmentConfig(newConfig)
              onUpdate(newConfig)
            }}
            placeholder='5'
            type='number'
            value={segmentConfig.num_event_occurrences}
          />
          <span>
            or more times in the last
          </span>
          <Input
            className='w-20'
            min={1}
            onChange={e => {
              const newConfig = { ...segmentConfig, num_lookback_days: parseInt(e.target.value) }
              setSegmentConfig(newConfig)
              onUpdate(newConfig)
            }}
            placeholder='5'
            type='number'
            value={segmentConfig.num_lookback_days}
          />
          <span>
            days
          </span>
        </>
      )}
      {isComplete && displayAndOrButtons && (
        <div className='flex items-center space-x-2 ml-2'>
          <Button className='text-xs p-2' variant='ghost' onClick={() => onNewFilterClick('and')}>
            + AND
          </Button>
          <Button className='text-xs p-2' variant='ghost' onClick={() => onNewFilterClick('or')}>
            + OR
          </Button>
        </div>
      )}
      {displayDeleteButton && (
        <Button className='p-2 hover:text-red-400' variant='ghost' onClick={onDelete}>
          <LuTrash className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}