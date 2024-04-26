import { Button } from "@/components/ui/button";
import WhereClause from "./WhereClause";
import { CornerDownRightIcon, TrashIcon } from "lucide-react";

export default function WhereClauseGroup({ group, propertyOptions, onUpdate, onNewQuery, ...props }) {
  const { queries } = group;

  const updateGroupQueries = queries => {
    onUpdate({ ...group, queries });
  }

  return (
    queries.map((query, index) => (
      <div {...props} className={`flex items-center space-x-1 ${props.className}`}>
        <div>
          <WhereClause
            key={index}
            query={query}
            propertyOptions={propertyOptions}
            leadingText={
              <div className="flex items-center space-x-2">
                <CornerDownRightIcon className={`h-4 w-4 ${index > 0 ? 'opacity-0' : ''}`} />
                {index > 0 ? 'And' : 'Where'}
              </div>
            }
            onUpdate={updatedQuery => {
              queries[index] = updatedQuery;
              updateGroupQueries(queries);
            }}
          />
        </div>
        {index === queries.length - 1 && (
          <Button
            variant='ghost'
            className='text-gray-700'
            onClick={() => {
              updateGroupQueries([
                ...queries,
                { previous_query_operator: 'AND', sequence_index: index + 1, property: null, operator: null, value: null }
              ])
            }}
          >
            + AND
          </Button>
        )}
        <Button
          variant='ghost'
          className='transition-colors duration-300 hover:text-red-500'
          onClick={() => updateGroupQueries(queries.filter((_, i) => i !== index))}
        >
          <TrashIcon className='h-4 w-4' />
        </Button>
      </div>
    ))
  )
}