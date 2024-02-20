import { Button } from "@/components/ui/button";
import { LuTrash } from "react-icons/lu";
import QueryFilterBuilder from "./QueryFilterBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Badge } from "../ui/badge";

export default function QueryFilterGroupBuilder({
  className,
  defaultFilters = [{ sequence_index: 0, previous_query_filter_relationship_operator: null, config: {} }],
  onDeleteClick,
  onNewGroupClick,
  onUpdate,
  previousQueryFilterGroupRelationshipOperator,
  showDeleteButton,
  showNewGroupButtons,
  uniqueEvents,
  uniqueUserProperties,
}) {
  const [queryFilters, setQueryFilters] = useState(defaultFilters)

  if (!uniqueUserProperties || !uniqueEvents) {
    return <Skeleton className='h-10 w-20' />
  }

  const allFiltersComplete = queryFilters.every(filter => {
    return filter.type === 'QueryFilterGroups::UserProperty'
      ? filter.config.property_name && filter.config.operator && (filter.config.operator === "is_defined" || filter.config.operator === "is_not_defined" || filter.config.property_value)
      : filter.config.event_name && filter.config.num_event_occurrences && filter.config.num_lookback_days;
  })

  return (
    <>
      {previousQueryFilterGroupRelationshipOperator && (
        <div className='flex justify-center mb-4 relative'>
          <span className="absolute w-0.5 bg-gray-400 left-0 right-0 mx-auto z-0" style={{ height: '200%', top: '-50%' }} />
          <Badge variant='secondary' className='z-1 w-fit py-1 px-4 text-sm bg-green-100 text-green-500 ring-green-600/20 cursor-default transition-colors hover:bg-green-200' style={{ zIndex: 1 }}>
            {previousQueryFilterGroupRelationshipOperator.toUpperCase()}
          </Badge>
        </div>
      )}
      <div className={className}>
        {queryFilters.map((filter, i) => {
          let className = ''
          if (i > 0) {
            className = 'mt-4 ml-8'
          }
          return (
            <QueryFilterBuilder
              key={i}
              className={className}
              defaultFilterConfig={filter.config}
              displayAndOrButtons={i === queryFilters.length - 1}
              displayDeleteButton={i > 0}
              onNewFilterClick={operator => setQueryFilters([...queryFilters, { sequence_index: i + 1, previous_query_filter_relationship_operator: operator, config: {} }])}
              onDelete={() => setQueryFilters(queryFilters.filter((_, index) => index !== i))}
              onUpdate={updatedFilter => {
                const newFilters = [...queryFilters]
                newFilters[i] = { ...newFilters[i], ...updatedFilter }
                setQueryFilters(newFilters)
                onUpdate(newFilters);
              }}
              operator={filter.previous_query_filter_relationship_operator}
              uniqueUserProperties={uniqueUserProperties}
              uniqueEvents={uniqueEvents}
            />
          )
        })}
      </div>
      {showNewGroupButtons && (
        <div className='flex justify-center mt-2 space-x-2'>
          <Button className='text-xs p-2' variant='ghost' onClick={() => onNewGroupClick('and')}>
            + AND
          </Button>
          <Button className='text-xs p-2' variant='ghost' onClick={() => onNewGroupClick('or')}>
            + OR
          </Button>
          {showDeleteButton && (
            <Button className='p-2 hover:text-red-400' variant='ghost' onClick={onDeleteClick}>
              <LuTrash className='h-4 w-4' />
            </Button>
          )}
        </div>
      )}
    </>
  )
}