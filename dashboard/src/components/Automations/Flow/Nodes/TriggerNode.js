'use client'

import { memo, useState } from 'react';
import CustomNode from './CustomNode';
import Combobox from '@/components/utils/Combobox';
import { LuZap } from "react-icons/lu";
import { useNodeId, useNodes } from 'reactflow';
import useCommonQueries from '@/hooks/useCommonQueries';

export default memo(({ data }) => {
  const { id, event_name, width, onUpdate } = data;
  const [currentlySelectedEventName, setCurrentlySelectedEventName] = useState(event_name)


  const nodeId = useNodeId();
  const currentNodes = useNodes();
  const { uniqueEventsAndCounts } = useCommonQueries();
  const uniqueEvents = (uniqueEventsAndCounts || []).map(e => e.name).sort()

  return (
    <CustomNode
      id={id}
      width={width}
      icon={<LuZap className='inline mr-2 text-emerald-500' size={16} />}
      includeTopHandle={false}
      title='Event Trigger'
    >
      <Combobox
        placeholder='Select a trigger' 
        options={uniqueEvents}
        selectedValue={currentlySelectedEventName}
        onSelectionChange={eventName => {
          setCurrentlySelectedEventName(eventName)
          onUpdate({ id: nodeId, currentNodes, data: { ...data, event_name: eventName } })
        }}
      />
    </CustomNode >
  );
});