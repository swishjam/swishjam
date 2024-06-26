'use client'

import { memo, useEffect } from 'react';
import CustomNode from './CustomNode';
import ComboboxEvents from '@/components/utils/ComboboxEvents';
import { LuZap } from "react-icons/lu";
import useCommonQueries from '@/hooks/useCommonQueries';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';
import DottedUnderline from '@/components/utils/DottedUnderline';

export default memo(({ id, data }) => {
  const { event_name, executionStepResults } = data;
  const { setSelectedEntryPointEventName, updateNode } = useAutomationBuilder();

  const { uniqueEventsAndCounts } = useCommonQueries();
  const uniqueEvents = (uniqueEventsAndCounts || []).map(e => e.name).sort()

  useEffect(() => {
    setSelectedEntryPointEventName(event_name)
  }, [id])

  return (
    <CustomNode
      id={id}
      canDelete={false}
      data={data}
      icon={<LuZap className='inline mr-2 text-emerald-500' size={16} />}
      includeTopHandle={false}
      requiredData={['event_name']}
      title='Event Trigger'
    >
      {executionStepResults
        ? <><DottedUnderline>{event_name}</DottedUnderline> event was triggered.</>
        : (
          <ComboboxEvents
            buttonClass='w-full'
            placeholder='Select a trigger'
            options={uniqueEvents}
            selectedValue={event_name}
            onSelectionChange={eventName => {
              setSelectedEntryPointEventName(eventName)
              updateNode(id, { ...data, event_name: eventName })
            }}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />
        )
      }
    </CustomNode >
  );
});