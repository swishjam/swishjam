'use client'
import ReactFlow, {
  Handle,
  Position,
} from 'reactflow';
import { memo } from 'react';

import { LuZap } from "react-icons/lu";
import { ComboboxEvents } from "@/components/ComboboxEvents";

const TriggerNode = memo(({ data }) => {
  const { content, onChange, width, height } = data;

  return (
    <div style={{ width, pointerEvents: 'all'}} className='nodrag nopan card text-left align-top'>
      <p className='text-md font-medium leading-none flex items-center mb-1'>
        <LuZap className='inline mr-2 text-emerald-500' size={16} />
        Flow Trigger
      </p>
      <ComboboxEvents
        btnClass='mt-4' 
      />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default TriggerNode;