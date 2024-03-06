'use client'

import { memo } from 'react';
import CustomNode from './CustomNode';
import ComboboxEvents from '@/components/utils/ComboboxEvents';
import { LuZap } from "react-icons/lu";
import { useNodeId, useNodes } from 'reactflow';
import useCommonQueries from '@/hooks/useCommonQueries';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';
import DottedUnderline from '@/components/utils/DottedUnderline';

export default memo(({ data }) => {
  const { id, event_name, onUpdate, executionStepResults } = data;
  const { setSelectedEntryPointEventName } = useAutomationBuilder();

  const nodeId = useNodeId();
  const currentNodes = useNodes();
  const { uniqueEventsAndCounts } = useCommonQueries();
  const uniqueEvents = (uniqueEventsAndCounts || []).map(e => e.name).sort()

  return (
    <CustomNode
      id={id}
      data={data}
      icon={<LuZap className='inline mr-2 text-emerald-500' size={16} />}
      includeTopHandle={false}
      requiredData={['event_name']}
      title='Event Trigger'
    >
      {executionStepResults
        ? <DottedUnderline>{event_name}</DottedUnderline>
        : (
          <ComboboxEvents
            placeholder='Select a trigger'
            options={uniqueEvents}
            selectedValue={event_name}
            onSelectionChange={eventName => {
              setSelectedEntryPointEventName(eventName)
              onUpdate({ id: nodeId, currentNodes, data: { ...data, event_name: eventName } })
            }}
          />
        )
      }
    </CustomNode >
  );
});