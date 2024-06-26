import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"
import Combobox from "@/components/utils/Combobox"
import { Input } from "@/components/ui/input"
import { InfoIcon } from "lucide-react"
import { useState } from "react"
import { LuTrash } from "react-icons/lu"
import useSheet from "@/hooks/useSheet"
import ComboboxEvents from "../utils/ComboboxEvents"
import EventCountConfiguration from "./FilterConfigurations/EventCount"
import ProfilePropertyConfiguration from "./FilterConfigurations/ProfileProperty"

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

const AndOrButtons = ({ onNewFilterClick }) => (
  <div className='flex items-center space-x-2 ml-2'>
    <Button className='text-xs py-2 px-4' variant='ghost' onClick={() => onNewFilterClick('and')}>
      + AND
    </Button>
    <Button className='text-xs py-2 px-4' variant='ghost' onClick={() => onNewFilterClick('or')}>
      + OR
    </Button>
  </div>
)

const DeleteButton = ({ onDelete }) => (
  <Button className='py-2 px-4 hover:text-red-400' variant='ghost' onClick={onDelete}>
    <LuTrash className='h-4 w-4' />
  </Button>
)

const OperatorBadge = ({ operator }) => (
  <div className='inline-flex relative mr-2 group'>
    <span className="absolute w-0.5 bg-gray-200 group-hover:bg-gray-300 left-0 right-0 mx-auto z-0" style={{ height: '150%', top: '-80%' }} />
    <Badge variant='secondary' className='justify-center z-10 py-1 w-14 text-sm bg-green-100 text-green-500 ring-green-600/20 cursor-default transition-colors group-hover:bg-green-200'>
      {operator.toUpperCase()}
    </Badge>
  </div>
)

export default function QueryFilterBuilder({
  defaultFilter = { config: {} },
  displayAndOrButtons,
  displayDeleteButton,
  onNewFilterClick,
  onDelete,
  onUpdate,
  operator,
  profileType = 'user',
  uniquePropertiesForProfileType,
  uniqueEvents,
}) {
  const [filter, setFilter] = useState(defaultFilter)

  const updateSelectedProfilePropertyOrEventName = selectedValue => {
    const updatedFilterData = { ...filter, config: { ...filter.config || {}, profile_type: profileType } }
    const selectedObject = selectedValue.split('.')[0]
    const filterType = {
      user: 'QueryFilters::ProfileProperty',
      organization: 'QueryFilters::ProfileProperty',
      event: 'QueryFilters::EventCountForProfileOverTimePeriod'
    }[selectedObject] || 'QueryFilters::EventCountForProfileOverTimePeriod';
    updatedFilterData.type = filterType
    // remove any previous config properties that are not relevant to the new filter type
    if (filterType === "QueryFilters::EventCountForProfileOverTimePeriod") {
      delete updatedFilterData.config.property_name
      delete updatedFilterData.config.operator
      delete updatedFilterData.config.property_value
      if (!updatedFilterData.config.event_count_operator) {
        updatedFilterData.config.event_count_operator = 'greater_than_or_equal_to'
      }
      updatedFilterData.config.event_name = selectedValue.split('.').slice(1).join('.')
    } else if (filterType === "QueryFilters::ProfileProperty") {
      delete updatedFilterData.config.event_name
      delete updatedFilterData.config.num_occurrences
      delete updatedFilterData.config.num_lookback_days
      delete updatedFilterData.config.event_count_operator
      if (!updatedFilterData.config.operator) {
        updatedFilterData.config.operator = 'equals'
      }
      updatedFilterData.config.property_name = selectedValue.split('.').slice(1).join('.')
    }
    setFilter(updatedFilterData)
    onUpdate(updatedFilterData)
  }

  const isComplete = filter.type === 'QueryFilters::ProfileProperty'
    ? filter.config.property_name && filter.config.operator && (['is_defined', 'is_not_defined', 'is_generic_email', 'is_not_generic_email'].includes(filter.config.operator) || filter.config.property_value)
    : filter.config.event_name && filter.config.num_occurrences !== undefined && filter.config.num_lookback_days !== undefined;

  const onConfigChange = newConfig => {
    const newFilterData = { ...filter, config: { ...filter.config, ...newConfig } }
    setFilter(newFilterData)
    onUpdate(newFilterData)
  }

  const eventAndPropertyOptions = [
    ...(uniquePropertiesForProfileType.map(property => `${profileType}.${property}`)),
    ...(uniqueEvents).map(event => `event.${event}`),
  ]

  const succeedingContent = (
    <>
      {displayAndOrButtons && isComplete ? <AndOrButtons onNewFilterClick={onNewFilterClick} /> : <></>}
      {displayDeleteButton && <DeleteButton onDelete={onDelete} />}
    </>
  )

  return (
    filter.config.property_name
      ? (
        <ProfilePropertyConfiguration
          precedingContent={operator && <OperatorBadge operator={operator} />}
          profileType={profileType}
          onConfigChange={onConfigChange}
          property={filter.config.property_name}
          operator={filter.config.operator}
          propertyValue={filter.config.property_value}
          propertyOptions={eventAndPropertyOptions}
          onPropertySelect={updateSelectedProfilePropertyOrEventName}
          succeedingContent={succeedingContent}
        />
      ) : (
        <EventCountConfiguration
          precedingContent={operator && <OperatorBadge operator={operator} />}
          numOccurrences={filter.config.num_occurrences}
          numLookbackDays={filter.config.num_lookback_days}
          eventName={filter.config.event_name}
          eventCountOperator={filter.config.event_count_operator}
          onEventOrPropertySelect={updateSelectedProfilePropertyOrEventName}
          onConfigChange={onConfigChange}
          eventOrPropertyOptions={eventAndPropertyOptions}
          profileType={profileType}
          succeedingContent={succeedingContent}
        />
      )
  )
}

const Oldddd = () => {
  <div className={`flex items-center space-x-4 ${className}`}>
    <div className='flex text-sm items-center space-x-2 flex-nowrap'>
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
          {humanizedProfileType}s
          {!filter.type && ' who '}
          {filter.type === "QueryFilters::ProfileProperty" && ' whose '}
          {filter.type === "QueryFilters::EventCountForProfileOverTimePeriod" && ' who have triggered the'}
        </span>
      </div>
      <ComboboxEvents
        selectedValue={filter.config.property_name ? `${profileType}.${filter.config.property_name}` : filter.config.event_name ? `event.${filter.config.event_name}` : null}
        onSelectionChange={updateSelectedProfilePropertyOrEventName}
        options={[
          ...(uniquePropertiesForProfileType.map(property => `${profileType}.${property}`)),
          ...(uniqueEvents).map(event => `event.${event}`),
        ]}
        placeholder="Select a property"
      />
      {filter.type === "QueryFilters::ProfileProperty" && (
        <>
          <span>
            property
          </span>
          <Combobox
            buttonClass='w-fit'
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
      {filter.type === "QueryFilters::EventCountForProfileOverTimePeriod" && (
        <>
          <span>
            event
          </span>
          <br />
          <Combobox
            buttonClass='w-fit'
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
}