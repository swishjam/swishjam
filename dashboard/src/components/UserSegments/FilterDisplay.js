import { Badge } from "@/components/ui/badge";

const VariableName = ({ name }) => <span className='italic underline decoration-dotted text-gray-600 hover:text-gray-900 cursor-default transition-colors'>{name}</span>

export default function FilterDisplay({ filter }) {
  return (
    <div className='text-sm my-2'>
      {filter.parent_relationship_operator && (
        <Badge variant='secondary' className={`w-10 py-1 px-2 text-xs justify-center mr-2 ${filter.parent_relationship_operator ? 'opacity-100' : 'opacity-0'}`}>
          {(filter.parent_relationship_operator || 'AND').toUpperCase()}
        </Badge>
      )}
      {filter.config.object_type === "user" && (
        <>
          Users who's{' '}<VariableName name={filter.config.user_property_name} />{' '}property{' '}<VariableName name={filter.config.user_property_operator} />
          {filter.config.user_property_operator !== "is_defined" && filter.config.user_property_operator !== "is_not_defined" && (
            <>
              {' '}<VariableName name={filter.config.user_property_value} />
            </>
          )}
        </>
      )}
      {filter.config.object_type === "event" && (
        <>
          Users who have triggered the{' '}<VariableName name={filter.config.event_name} />{' '}event{' '}<VariableName name={`${filter.config.num_event_occurrences} or more times`} />{' '} in the last{' '}<VariableName name={`${filter.config.num_lookback_days} days`} />
        </>
      )}
    </div>
  )
}