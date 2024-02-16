import DottedUnderline from "@/components/utils/DottedUnderline"

export default function FiltersDisplayFeed({ filters }) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {filters?.map((filter, i) => (
          <li key={filter.id}>
            <div className="relative pb-8">
              {i !== filters.length - 1 ? (
                <span className="absolute z-10 left-8 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3 items-center rounded w-fit px-4 cursor-default transition-colors hover:bg-gray-50 ">
                <div>
                  {filter.parent_relationship_operator
                    ? (
                      <span className='bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white text-sm font-medium'>
                        {filter.parent_relationship_operator}
                      </span>
                    ) : (
                      <span className='bg-gray-200 h-4 w-4 ml-2 rounded-full flex items-center justify-center ring-4 ring-white' />
                    )}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div className='text-sm my-2'>
                    {filter.config.object_type === "user" && (
                      <>
                        Users who's <DottedUnderline>{filter.config.user_property_name}</DottedUnderline> property <DottedUnderline>{filter.config.user_property_operator}</DottedUnderline>
                        {filter.config.user_property_operator !== "is_defined" && filter.config.user_property_operator !== "is_not_defined" && (
                          <>
                            {' '}<DottedUnderline>{filter.config.user_property_value}</DottedUnderline>
                          </>
                        )}
                      </>
                    )}
                    {filter.config.object_type === "event" && (
                      <>
                        Users who have triggered the <DottedUnderline>{filter.config.event_name}</DottedUnderline> event <DottedUnderline>{filter.config.num_event_occurrences} or more times</DottedUnderline> in the last <DottedUnderline>{filter.config.num_lookback_days} days</DottedUnderline>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div >
  )
}