import DottedUnderline from "@/components/utils/DottedUnderline";
import { CornerDownRightIcon } from "lucide-react";

export default function QueryDetailsComposer({ event, property, aggregationMethod, whereClauseGroups }) {
  return (
    <div className='text-sm text-gray-700 font-normal p-4'>
      <h3 className='font-medium'>Query Details:</h3>
      <div className='mt-2'>
        Visualizes the <DottedUnderline>{aggregationMethod}</DottedUnderline> of the <DottedUnderline>{event}</DottedUnderline> event{property ? '\'s' : ''}{property && <><DottedUnderline>{property}</DottedUnderline> property</>}
        {(whereClauseGroups || []).map((group, i) => (
          <div key={i} className='ml-4 mt-2'>
            {(group.queries || []).map((query, j) => (
              <div className="flex items-center space-x-1" key={j}>
                <CornerDownRightIcon className={`h-4 w-4 ${j > 0 ? 'opacity-0' : ''}`} />
                {j > 0 ? '' : <span>Where</span>}
                {query.previous_query_operator && (
                  <div className='italic'>
                    {query.previous_query_operator}
                  </div>
                )}
                <div>{query.property.includes('user.') ? 'the user\'s ' : 'the event\'s '}{query.property.replace(/user\./i, '')} property {query.operator.replace(/_/g, ' ')} {query.value ? `"${query.value}"` : null}</div>
              </div>
            ))}
            <div>{group.previous_group_operator}</div>
          </div>
        ))}
      </div>
    </div>
  )
}