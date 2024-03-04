'use client'

import { memo, useState } from 'react';
import CustomNode from './CustomNode';
import Combobox from '@/components/utils/Combobox';
import { LuZap } from "react-icons/lu";

export default memo(({ data }) => {
  const [currentlySelectedEventName, setCurrentlySelectedEventName] = useState(data.selectedEvent)

  return (
    <CustomNode
      id={data.id}
      width={data.width}
      icon={<LuZap className='inline mr-2 text-emerald-500' size={16} />}
      includeTopHandle={false}
      title='Event Trigger'
    >
      <Combobox
        options={data.eventOptions}
        selectedValue={currentlySelectedEventName}
        onSelectionChange={eventName => {
          setCurrentlySelectedEventName(eventName)
          data.onUpdate(eventName)
        }}
      />
    </CustomNode >
  );
});