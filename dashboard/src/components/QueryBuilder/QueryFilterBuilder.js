import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"
import Combobox from "@/components/utils/Combobox"
import { Input } from "@/components/ui/input"
import { SparklesIcon, UserCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { LuTrash } from "react-icons/lu"

export default function UserSegmentFilterConfiguration({
  className,
  defaultFilter = { config: {} },
  displayAndOrButtons,
  displayDeleteButton,
  onNewFilterClick,
  onDelete,
  onUpdate,
  operator,
  uniqueUserProperties,
  uniqueEvents,
}) {
  const [filter, setFilter] = useState(defaultFilter)

  useEffect(() => {
    setFilter(defaultFilter)
  }, [defaultFilter])

  const updateSelectedUserPropertyOrEventName = selectedValue => {
    const updatedFilterData = { ...filter }
    const selectedObject = selectedValue.split('.')[0]
    const objectType = {
      user: 'QueryFilters::UserProperty',
      event: 'QueryFilters::EventCountForUserOverTimePeriod'
    }[selectedObject]
    updatedFilterData.type = objectType
    if (objectType === "QueryFilters::EventCountForUserOverTimePeriod") {
      delete updatedFilterData.config.property_name
      delete updatedFilterData.config.operator
      delete updatedFilterData.config.property_value
      updatedFilterData.config.event_name = selectedValue.split('.').slice(1).join('.')
    } else if (objectType === "QueryFilters::UserProperty") {
      delete updatedFilterData.config.event_name
      delete updatedFilterData.config.num_occurrences
      delete updatedFilterData.config.num_lookback_days
      if (!updatedFilterData.config.operator) {
        updatedFilterData.config.operator = 'equals'
      }
      updatedFilterData.config.property_name = selectedValue.split('.').slice(1).join('.')
    } else {
      throw new Error('Unexpected object type, expected either `user` or `event`, got:', selectedObject)
    }
    setFilter(updatedFilterData)
    onUpdate(updatedFilterData)
  }

  const formattedUserPropertyOptions = uniqueUserProperties.map(option => ({ label: option, value: `user.${option}` }))
  const formattedEventPropertyOptions = uniqueEvents.map(option => ({ label: option, value: `event.${option}` }))

  const isComplete = filter.config.type === 'QueryFilters::UserProperty'
    ? filter.config.property_name && filter.config.operator && (filter.config.operator === "is_defined" || filter.config.operator === "is_not_defined" || filter.config.property_value)
    : filter.config.event_name && filter.config.num_occurrences && filter.config.num_lookback_days;

  return (
    <div className={`flex text-sm items-center space-x-2 ${className}`}>
      <span>
        {operator && (
          <div className='inline-flex relative mr-2'>
            <span className="absolute w-0.5 bg-gray-400 left-0 right-0 mx-auto z-0" style={{ height: '150%', top: '-50%' }} />
            <Badge variant='secondary' className='justify-center z-10 py-1 w-14 text-sm bg-green-100 text-green-500 ring-green-600/20 cursor-default transition-colors hover:bg-green-200'>
              {operator.toUpperCase()}
            </Badge>
          </div>
        )}
        Users who have triggered the
      </span>
      <Combobox
        selectedValue={filter.config.property_name ? `user.${filter.config.property_name}` : filter.config.event_name ? `event.${filter.config.event_name}` : null}
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
      {filter.config.type === "QueryFilters::UserProperty" && (
        <>
          <span>
            property
          </span>
          <Combobox
            selectedValue={filter.config.operator}
            onSelectionChange={selectedValue => {
              const newFilterData = { ...filter, config: { ...filter.config, operator: selectedValue } }
              setFilter(newConfig)
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
          {filter.config.operator !== "is_defined" && filter.config.operator !== "is_not_defined" && (
            <Input
              className='w-fit max-w-[200px]'
              type='text'
              placeholder='Property value'
              value={filter.config.property_value}
              onChange={e => {
                const newFilterData = { ...filter, config: { ...filter.config, property_value: e.target.value } }
                setFilter(newFilterData)
                onUpdate(newFilterData)
              }}
            />
          )}
        </>
      )}
      {filter.config.type === "QueryFilters::EventCountForUserOverTimePeriod" && (
        <>
          <span>
            event
          </span>
          <Input
            className='w-20'
            min={1}
            onChange={e => {
              const newFilterData = { ...filter, config: { ...filter.config, num_occurrences: parseInt(e.target.value) } }
              setFilterConfig(newFilterData)
              onUpdate(newFilterData)
            }}
            placeholder='5'
            type='number'
            value={filter.config.num_occurrences}
          />
          <span>
            or more times in the last
          </span>
          <Input
            className='w-20'
            min={1}
            onChange={e => {
              const newFilterData = { ...filter, config: { ...filter.config, num_lookback_days: parseInt(e.target.value) } }
              setFilterConfig(newFilterData)
              onUpdate(newFilterData)
            }}
            placeholder='5'
            type='number'
            value={filter.config.num_lookback_days}
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