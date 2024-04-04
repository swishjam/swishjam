import DottedUnderline from "@/components/utils/DottedUnderline"
import { Skeleton } from "../ui/skeleton"

const FilterItem = ({ filter, operator, className }) => {
  return (
    <div className={`relative flex space-x-3 items-center rounded w-fit px-4 pr-4 cursor-default transition-colors hover:bg-gray-50 ${className}`} >
      <div>
        {operator
          ? (
            <span className={`bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white text-xs font-medium`}>
              {operator}
            </span>
          ) : (
            <span className='bg-gray-200 h-4 w-4 ml-2 rounded-full flex items-center justify-center ring-4 ring-white' />
          )}
      </div>
      <div>
        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
          <div className='text-sm my-2'>
            {filter.type === "QueryFilters::ProfileProperty" && (
              <>
                {filter.config.profile_type === 'user' ? 'Users' : 'Organizations'} whose <DottedUnderline>{filter.config.property_name}</DottedUnderline> property <DottedUnderline>{filter.config.operator}</DottedUnderline>
                {filter.config.operator !== "is_defined" && filter.config.operator !== "is_not_defined" && (
                  <>
                    {' '}<DottedUnderline>{filter.config.property_value}</DottedUnderline>
                  </>
                )}
              </>
            )}
            {filter.type === "QueryFilters::EventCountForProfileOverTimePeriod" && (
              <>
                {filter.config.profile_type === 'user' ? 'Users' : 'Organizations'} who have triggered the <DottedUnderline>{filter.config.event_name}</DottedUnderline> event <DottedUnderline>{filter.config.event_count_operator.replace(/_/g, ' ')} {filter.config.num_occurrences} times</DottedUnderline> in the last <DottedUnderline>{filter.config.num_lookback_days} days</DottedUnderline>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FilterGroupItem = ({ filterGroup }) => {
  const firstFilter = filterGroup.query_filters[0]
  const otherFilters = filterGroup.query_filters.slice(1)
  return (
    <li key={filterGroup.id}>
      <div className="relative pb-8">
        <FilterItem filter={firstFilter} operator={filterGroup.previous_query_filter_group_relationship_operator} />
        {otherFilters.length > 0 && (
          otherFilters.map((filter, i) => {
            return (
              <div className='flex'>
                <div
                  className='w-10 border-b-2 border-l-2 border-gray-200 ml-8 -translate-y-1/2'
                  style={{ borderBottomLeftRadius: '0.5rem' }}
                />
                <FilterItem
                  className='px-0'
                  key={i}
                  filter={filter}
                  operator={filter.previous_query_filter_relationship_operator}
                />
              </div>
            )
          })
        )}
      </div>
    </li>
  )
}

export default function FilterGroupsDisplay({ filterGroups }) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {filterGroups === undefined
          ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <div className="relative pb-8">
                  {i !== 2 ? (
                    <span className="absolute z-10 left-8 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" style={{ left: '2rem' }} />
                  ) : null}
                  <div className="relative flex space-x-3 items-center cursor-default ">
                    <div>
                      <Skeleton className={`${i > 0 ? 'h-8 w-8' : 'h-4 w-4'} rounded-full ml-2 ring-4 ring-white`} />
                    </div>
                    <Skeleton className='w-72 h-8' />
                  </div>
                </div>
              </li>
            ))
          ) : (
            filterGroups.length === 1 && filterGroups[0].query_filters.length === 1
              ? (
                <>
                  <div className="flex min-w-0 flex-1 space-x-4 pt-1.5 mb-4">
                    <span className='bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white text-xs font-medium'>
                      1.
                    </span>
                    <div className='text-sm my-2'>
                      {filterGroups[0].query_filters[0].type === "QueryFilters::ProfileProperty" && (
                        <>
                          {filterGroups[0].query_filters[0].config.profile_type === 'user' ? 'Users' : 'Organizations'} whose <DottedUnderline>{filterGroups[0].query_filters[0].config.property_name}</DottedUnderline> property <DottedUnderline>{filterGroups[0].query_filters[0].config.operator}</DottedUnderline>
                          {filterGroups[0].query_filters[0].config.operator !== "is_defined" && filterGroups[0].query_filters[0].config.operator !== "is_not_defined" && (
                            <>
                              {' '}<DottedUnderline>{filterGroups[0].query_filters[0].config.property_value}</DottedUnderline>
                            </>
                          )}
                        </>
                      )}
                      {filterGroups[0].query_filters[0].type === "QueryFilters::EventCountForProfileOverTimePeriod" && (
                        <>
                          {filterGroups[0].query_filters[0].config.profile_type === 'user' ? 'Users' : 'Organizations'} who have triggered the <DottedUnderline>{filterGroups[0].query_filters[0].config.event_name}</DottedUnderline> event <DottedUnderline> {filterGroups[0].query_filters[0].config.event_count_operator.replace(/_/g, ' ')} {filterGroups[0].query_filters[0].config.num_occurrences} times</DottedUnderline> in the last <DottedUnderline>{filterGroups[0].query_filters[0].config.num_lookback_days} days</DottedUnderline>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                filterGroups.map((filterGroup, i) => (
                  <li key={i}>
                    <div className="relative">
                      {i !== filterGroups.length - 1 ? (
                        <span className="absolute z-10 left-8 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" style={{ left: '2rem' }} />
                      ) : null}
                      <div className="relative flex space-x-3 items-center cursor-default ">
                        <FilterGroupItem key={i} filterGroup={filterGroup} />
                      </div>
                    </div>
                  </li>
                ))
              )
          )
        }
      </ul>
    </div >
  )
}