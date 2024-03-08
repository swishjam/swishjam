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
      icon={<LuFilter className="h-5 w-5" />}
      requiredData={['next_automation_step_condition_rules']}
      title="Filter"
    >
      {data.next_automation_step_condition_rules &&
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200 w-full">
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


{/* <span className='text-sm block' key={i}>
  {i > 0 && 'and '}<DottedUnderline>{rule.property}</DottedUnderline> {rule.operator} <DottedUnderline>{rule.property_value}</DottedUnderline>{i < 3 && ','}
</span> */}