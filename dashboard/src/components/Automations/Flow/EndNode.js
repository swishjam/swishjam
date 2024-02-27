'use client'
import ReactFlow, {
  Handle,
  Position,
} from 'reactflow';
import { memo } from 'react';

import { LuFlag } from "react-icons/lu";
import { ComboboxEvents } from "@/components/ComboboxEvents";

const EndNode = memo(({ data }) => {
  const { content, onChange, width, height } = data;

  return (
    <div style={{ width }} className='!pointer-default bg-white border border-gray-200 shadow-sm p-4 rounded-md overflow-hidden text-left align-top'>
      <p className='text-md font-medium leading-none flex items-center mb-1'>
        <LuFlag className='inline mr-2 text-swishjam' size={16} />
        End of Automation 
      </p>
      <Handle type="target" position={Position.Top} />
    </div>
  );
});

export default EndNode;