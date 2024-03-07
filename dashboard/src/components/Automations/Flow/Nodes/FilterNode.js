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
      requiredData={['rules']}
      title="Filter"
    >

      {data.rules &&
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                <LuDot size={24} className='text-swishjam -ml-1 -mr-1' />
                {data.rules.length} Rule{data.rules.length > 1 ? 's' : ''}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span className='truncate w-full'>{data.rules && data.rules.map(rule => `${rule.property} ${rule.operator} ${rule.property_value}`).join(' and ')}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }

    </CustomNode >
  )
});
