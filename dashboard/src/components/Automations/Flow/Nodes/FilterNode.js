'use client'

import { memo } from 'react';
import CustomNode from './CustomNode';
import ConfigureFilterAutomationStep from '../StepConfigurations/Filter';
//import { FilterIcon } from 'lucide-react';
import { LuDot, LuFilter } from 'react-icons/lu';

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
      {/* <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto mt-5 w-full truncate text-ellipsis">
        {JSON.stringify(data)}
      </h2> */}

      {/* <div className="flex items-center gap-x-1.5">
        <h2 className="truncate text-ellipsis w-full min-w-0 text-xs font-semibold leading-6 text-gray-600">
          #{data?.channel_name} {data?.message_body}
        </h2>
      </div> */}
      {data.rules && 
      <span className="inline-flex items-center gap-x-1 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
        <LuDot size={24} className='text-swishjam'/> 
        {data.rules.length} rule{data.rules.length > 1 ? 's' : ''}
      </span>}
    </CustomNode >
  )
});
