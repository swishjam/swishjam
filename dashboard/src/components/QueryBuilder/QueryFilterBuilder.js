import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"
import Combobox from "@/components/utils/Combobox"
import { Input } from "@/components/ui/input"
import { InfoIcon, SparklesIcon, UserCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { LuTrash } from "react-icons/lu"
import useSheet from "@/hooks/useSheet"

const GenericEmailsDocumentation = () => {
  const domains = ['aol', 'fastmail', 'gmx', 'gmail', 'hotmail', 'hushmail', 'icloud', 'inbox', 'list', 'live', 'mail', 'outlook',
    'proton', 'protonmail', 'qq', 'tutanota', 'ya', 'yandex', 'yahoo', 'zoho',
  ]
  const suffixes = ['com', 'info', 'net', 'ru', 'org']
  const emails = domains.map(domain => suffixes.map(suffix => `${domain}.${suffix}`)).flat()
  return (
    <>
      Instead of having to define the infinite number of generic email providers out there (ie: gmail.com, yahoo.com, outlook.com, etc..), we created a helper function for you to automatically filter in/out users with generic emails. Generic emails are classified as any email with the following domain:
      <div className='overflow-y-scroll max-h-[65vh]'>
        <ul className='list-disc ml-4 mt-4'>
          {emails.map(email => <li key={email}>{email}</li>)}
        </ul>
      </div>
    </>
  )
}

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
  uniqueOrganizationProperties,
}) {
  const [filter, setFilter] = useState(defaultFilter)
  const { openSheetWithContent } = useSheet();

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
      if (!updatedFilterData.config.event_count_operator) {
        updatedFilterData.config.event_count_operator = 'greater_than_or_equal_to'
      }
      updatedFilterData.config.event_name = selectedValue.split('.').slice(1).join('.')
    } else if (objectType === "QueryFilters::UserProperty") {
      delete updatedFilterData.config.event_name
      delete updatedFilterData.config.num_occurrences
      delete updatedFilterData.config.num_lookback_days
      delete updatedFilterData.config.event_count_operator
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

  let operatorOptions = [
    { label: "equals", value: "equals" },
    { label: "does not equal", value: "does_not_equal" },
    { label: "contains", value: "contains" },
    { label: "does not contain", value: "does_not_contain" },
    { label: 'is defined', value: 'is_defined' },
    { label: 'is not defined', value: 'is_not_defined' },
  ];
  if (filter.type === "QueryFilters::UserProperty" && filter.config.property_name === 'email') {
    operatorOptions = operatorOptions.concat([{ label: 'is not a generic email', value: 'is_not_generic_email' }, { label: 'is a generic email', value: 'is_generic_email' }])
  } else {
    operatorOptions = operatorOptions.concat([
      { label: "greater than", value: "greater_than" },
      { label: "less than", value: "less_than" },
      { label: "greater than or equal to", value: "greater_than_or_equal_to" },
      { label: "less than or equal to", value: "less_than_or_equal_to" },
    ])
  }

  const isComplete = filter.type === 'QueryFilters::UserProperty'
    ? filter.config.property_name && filter.config.operator && (['is_defined', 'is_not_defined', 'is_generic_email', 'is_not_generic_email'].includes(filter.config.operator) || filter.config.property_value)
    : filter.config.event_name && filter.config.num_occurrences !== undefined && filter.config.num_lookback_days !== undefined;

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className={`flex text-sm items-center space-x-2 flex-nowrap`}>
        <div className='whitespace-nowrap flex items-center'>
          {operator && (
            <div className='inline-flex relative mr-2 group'>
              <span className="absolute w-0.5 bg-gray-200 group-hover:bg-gray-300 left-0 right-0 mx-auto z-0" style={{ height: '150%', top: '-80%' }} />
              <Badge variant='secondary' className='justify-center z-10 py-1 w-14 text-sm bg-green-100 text-green-500 ring-green-600/20 cursor-default transition-colors group-hover:bg-green-200'>
                {operator.toUpperCase()}
              </Badge>
            </div>
          )}
          <span>
            {!filter.type && 'Users who '}
            {filter.type === "QueryFilters::UserProperty" && 'Users whose '}
            {filter.type === "QueryFilters::EventCountForUserOverTimePeriod" && 'Users who have triggered the'}
          </span>
        </div>
        <Combobox
          selectedValue={filter.config.property_name ? `user.${filter.config.property_name}` : filter.config.event_name ? `event.${filter.config.event_name}` : null}
          onSelectionChange={updateSelectedUserPropertyOrEventName}
          options={[
            { type: "title", label: <div className='flex items-center'><UserCircleIcon className='h-4 w-4 mr-1' /> User Properties</div> },
            ...formattedUserPropertyOptions,
            { type: "title", label: <div className='flex items-center'><SparklesIcon className='h-4 w-4 mr-1' /> Events</div> },
            ...formattedEventPropertyOptions,
          ]}
          placeholder="Select a property"
        />
        {filter.type === "QueryFilters::UserProperty" && (
          <>
            <span>
              property
            </span>
            <Combobox
              selectedValue={filter.config.operator}
              onSelectionChange={selectedValue => {
                const newFilterData = { ...filter, config: { ...filter.config, operator: selectedValue } }
                setFilter(newFilterData)
                onUpdate(newFilterData)
              }}
              options={operatorOptions}
            />
            {['is_generic_email', 'is_not_generic_email'].includes(filter.config.operator) && (
              <a
                onClick={() => openSheetWithContent({ title: "Generic Emails", content: <GenericEmailsDocumentation /> })}
                className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
              >
                <InfoIcon className='h-3 w-3' />
              </a>
            )}
            {!["is_not_defined", "is_defined", "is_not_generic_email", 'is_generic_email'].includes(filter.config.operator) && (
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
        {filter.type === "QueryFilters::EventCountForUserOverTimePeriod" && (
          <>
            <span>
              event
            </span>
            <Combobox
              selectedValue={filter.config.event_count_operator || 'greater_than_or_equal_to'}
              onSelectionChange={selectedValue => {
                const newFilterData = { ...filter, config: { ...filter.config, event_count_operator: selectedValue } }
                setFilter(newFilterData)
                onUpdate(newFilterData)
              }}
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
              onChange={e => {
                const newFilterData = { ...filter, config: { ...filter.config, num_occurrences: e.target.value === '' ? undefined : parseInt(e.target.value) } }
                setFilter(newFilterData)
                onUpdate(newFilterData)
              }}
              placeholder='5'
              type='number'
              value={filter.config.num_occurrences}
            />
            <span className='whitespace-nowrap'>
              times in the last
            </span>
            <Input
              className='w-20'
              min={1}
              onChange={e => {
                const newFilterData = { ...filter, config: { ...filter.config, num_lookback_days: e.target.value === '' ? undefined : parseInt(e.target.value) } }
                setFilter(newFilterData)
                onUpdate(newFilterData)
              }}
              placeholder='5'
              type='number'
              value={filter.config.num_lookback_days}
            />
            <span>
              days.
            </span>
          </>
        )}
      </div>
      <div className='flex-shrink flex items-center space-x-2'>
        {isComplete && displayAndOrButtons ? (
          <div className='flex items-center space-x-2 ml-2'>
            <Button className='text-xs py-2 px-4' variant='ghost' onClick={() => onNewFilterClick('and')}>
              + AND
            </Button>
            <Button className='text-xs py-2 px-4' variant='ghost' onClick={() => onNewFilterClick('or')}>
              + OR
            </Button>
          </div>
        ) : <></>}
        {displayDeleteButton && (
          <Button className='py-2 px-4 hover:text-red-400' variant='ghost' onClick={onDelete}>
            <LuTrash className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}