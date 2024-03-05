'use client'

import CustomNode from './CustomNode';
import { LuFlag } from "react-icons/lu";
import { memo } from 'react';

export default memo(() => {
  return (
    <CustomNode
      icon={<LuFlag className='inline mr-2 text-swishjam' size={16} />}
      includeBottomHandle={false}
      isEditable={false}
      title='End of Automation'
    />
  )
});