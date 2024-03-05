'use client'

import { memo } from 'react';
import CustomNode from './CustomNode';
import Combobox from '@/components/utils/Combobox';
import { LuZap } from "react-icons/lu";
import { useNodeId, useNodes } from 'reactflow';
import useCommonQueries from '@/hooks/useCommonQueries';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';

export default memo(({ data }) => {
  const { id, event_name, onUpdate } = data;
  const { selectedEntryPointEventName, setSelectedEntryPointEventName } = useAutomationBuilder(event_name);

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
      <Combobox
        options={uniqueEvents}
        selectedValue={selectedEntryPointEventName}
        onSelectionChange={eventName => {
          setSelectedEntryPointEventName(eventName)
          onUpdate({ id: nodeId, currentNodes, data: { ...data, event_name: eventName } })
        }}
      />
    </CustomNode >
  );
});