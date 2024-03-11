import { Tooltipable } from "@/components/ui/tooltip";
import { SplitIcon, FilterIcon } from "lucide-react";

export default function NodeConnector({ wasSatisfied, isPending, condition }) {
  const connectorColor = isPending
    ? 'bg-blue-500 group-hover:bg-blue-700'
    : wasSatisfied
      ? 'bg-green-500 group-hover:bg-green-700'
      : 'bg-red-400 group-hover:bg-red-700';
  const filterIndicatorColor = isPending
    ? 'bg-blue-100 group-hover:bg-blue-300 text-blue-700'
    : wasSatisfied
      ? 'bg-green-100 group-hover:bg-green-300 text-green-700'
      : 'bg-red-100 group-hover:bg-red-300 text-red-700';

  const hasFilterRules = condition.next_automation_step_condition_rules.filter(rule => rule.type !== 'NextAutomationStepConditionRules::AlwaysTrue').length > 0;
  if (!hasFilterRules) {
    return <div className={`h-20 w-0.5  transition-all hover:bg-gray-700 ${connectorColor}`} />
  }
  return (
    <Tooltipable
      direction="right"
      offset={25}
      content={
        <>
          <span className='block text-sm font-semibold text-gray-700'>{condition.next_automation_step_condition_rules.length} Filter Rules:</span>
          {condition.next_automation_step_condition_rules.map((rule, i) => {
            return (
              <div key={i} className='flex items-center space-x-2'>
                <span>{rule.description}</span>
              </div>
            )
          })}
        </>
      }
    >
      <div className={`h-20 w-0.5 flex items-center justify-center relative group transition-all ${connectorColor}`}>
        <div className={`p-1.5 rounded-full absolute ring-1 ring-white flex items-center justify-center transition-all ${filterIndicatorColor}`}>
          {condition.next_automation_step_condition_rules > 1 ? <SplitIcon className='h-4 w-4' /> : <FilterIcon className='h-4 w-4' />}
        </div>
      </div>
    </Tooltipable>
  )
}