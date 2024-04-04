import { Button } from "@/components/ui/button";
import { LuTrash } from "react-icons/lu";
import QueryFilterBuilder from "./QueryFilterBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Badge } from "../ui/badge";

export default function QueryFilterGroupBuilder({
  className,
  defaultFilters = [{ sequence_index: 0, previous_query_filter_relationship_operator: null, config: {} }],
  hasGroupAfter = false,
  onDeleteClick,
  onNewGroupClick,
  onUpdate,
  previousQueryFilterGroupRelationshipOperator,
  showDeleteButton,
  showNewGroupButtons,
  profileType,
  uniqueEvents,
  uniquePropertiesForProfileType,
}) {
  const [queryFilters, setQueryFilters] = useState(defaultFilters)

  if (!uniquePropertiesForProfileType || !uniqueEvents) {
    return (
      <>
        <Skeleton className='rounded-md w-full h-40 bg-gray-200' />
        <Skeleton className='rounded-md w-full h-40 bg-gray-200 mt-4' />
      </>
    )
  }

  return (
    <>
      {previousQueryFilterGroupRelationshipOperator && (
        <div className='flex justify-center mb-4 relative group'>
          <span className="absolute w-0.5 bg-gray-200 group-hover:bg-gray-300 left-0 right-0 mx-auto z-0" style={{ height: '200%', top: '-50%' }} />
          <Badge variant='secondary' className='z-1 w-fit py-1 px-4 text-sm bg-green-100 text-green-500 ring-green-600/20 cursor-default transition-colors group-hover:bg-green-200' style={{ zIndex: 1 }}>
            {previousQueryFilterGroupRelationshipOperator.toUpperCase()}
          </Badge>
        </div>
      )}
      <div className={className}>
        {previousQueryFilterGroupRelationshipOperator && (
          <div className='absolute -top-1 left-0 right-0 mx-auto z-10 rounded-full w-1.5 h-1.5 bg-gray-200' />
        )}
        {queryFilters.map((filter, i) => {
          let className = ''
          if (i > 0) {
            className = 'mt-4 ml-8'
          }
          return (
            <div className={className} key={i}>
              <QueryFilterBuilder
                profileType={profileType}
                defaultFilter={filter}
                displayAndOrButtons={i === queryFilters.length - 1}
                displayDeleteButton={i > 0}
                onNewFilterClick={operator => {
                  const updatedFilters = [...queryFilters, { sequence_index: i + 1, previous_query_filter_relationship_operator: operator, config: {} }]
                  setQueryFilters(updatedFilters)
                  onUpdate(updatedFilters);
                }}
                onDelete={() => {
                  const updatedFilters = queryFilters.filter((_, index) => index !== i)
                  setQueryFilters(updatedFilters)
                  onUpdate(updatedFilters);
                }}
                onUpdate={updatedFilter => {
                  const newFilters = [...queryFilters]
                  newFilters[i] = { ...newFilters[i], ...updatedFilter }
                  setQueryFilters(newFilters)
                  onUpdate(newFilters);
                }}
                operator={filter.previous_query_filter_relationship_operator}
                uniquePropertiesForProfileType={uniquePropertiesForProfileType}
                uniqueEvents={uniqueEvents}
              />
            </div>
          )
        })}
        {hasGroupAfter && <div className='absolute -bottom-1 left-0 right-0 mx-auto z-10 rounded-full w-1.5 h-1.5 bg-gray-200' />}
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