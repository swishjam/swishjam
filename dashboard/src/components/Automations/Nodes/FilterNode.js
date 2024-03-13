'use client'

import { memo } from 'react';
import CustomNode from './CustomNode';
import ConfigureFilterAutomationStep from '../StepConfigurations/Filter';
//import { FilterIcon } from 'lucide-react';
import { LuDot, LuFilter } from 'react-icons/lu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default memo(({ id, data }) => {
  return (
    <CustomNode
      id={id}
      EditComponent={ConfigureFilterAutomationStep}
      data={data}
      dialogFullWidth={false}
      icon={<LuFilter className="h-5 w-5" />}
      requiredData={['next_automation_step_condition_rules']}
      title="Filter"
    >
      {data.next_automation_step_condition_rules && data.next_automation_step_condition_rules.length > 0 &&
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="cursor-default inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200 w-full hover:bg-gray-50 transition-colors">
                <LuDot size={24} className='text-swishjam -ml-1 -mr-1' />
                {data.next_automation_step_condition_rules.length} Rule{data.next_automation_step_condition_rules.length > 1 ? 's' : ''}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span className='truncate w-full'>{data.next_automation_step_condition_rules && data.next_automation_step_condition_rules.map(rule => `${rule.property} ${rule.operator} ${rule.value}`).join(' and ')}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }

    </CustomNode >
  )
});


{/* <span className='text-sm text-gray-700'>
  If {data.next_automation_step_condition_rules[0].property} {data.next_automation_step_condition_rules[0].operator} {data.next_automation_step_condition_rules[0].value}
</span>
{
  data.next_automation_step_condition_rules.length > 1 &&
    <span className='text-sm text-gray-700 ml-1'>
      and
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <DottedUnderline className='ml-1'>
              {data.next_automation_step_condition_rules.length - 1} more.
            </DottedUnderline>
          </TooltipTrigger>
          <TooltipContent>
            <span className='truncate w-full'>
              {data.next_automation_step_condition_rules && data.next_automation_step_condition_rules.slice(1).map(rule => `${rule.property} ${rule.operator} ${rule.value}`).join(' and ')}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
} */}