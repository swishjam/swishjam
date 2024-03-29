'use client'

import { memo } from 'react';
import CustomNode from './CustomNode';
import ConfigureFilterAutomationStep from '../StepConfigurations/Filter';
import { LuDot, LuFilter } from 'react-icons/lu';
import { Tooltipable } from "@/components/ui/tooltip"
import FormattedSwishjamVariable from '@/components/utils/FormattedSwishjamVariable';

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
        <Tooltipable
          content={
            <div className='cursor-default flex flex-col space-y-1'>
              {data.next_automation_step_condition_rules.map((rule, i) => (
                <span className='block' key={i}>
                  <FormattedSwishjamVariable includeBrackets={false} copiable={false}>
                    {rule.property}
                  </FormattedSwishjamVariable>
                  <span>{' '}{rule.operator.replaceAll('_', ' ')}</span>
                  {rule.value && (
                    <span className='italic ml-1'>
                      "{rule.value}"
                    </span>
                  )}
                  {i < data.next_automation_step_condition_rules.length - 1 && ' AND '}
                </span>
              ))}
            </div>
          }
        >
          <span className="cursor-default inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200 w-full hover:bg-gray-50 transition-colors">
            <LuDot size={24} className='text-swishjam' />
            {data.next_automation_step_condition_rules.length} rule{data.next_automation_step_condition_rules.length > 1 ? 's' : ''} to satisfy
          </span>
        </Tooltipable>
      }

    </CustomNode >
  )
});