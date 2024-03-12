'use client'

import CustomNode from './CustomNode';
import { LuFlag } from "react-icons/lu";
import { memo } from 'react';

export default memo(({ id, data }) => {
  return (
    <CustomNode
      id={id}
      canDelete={false}
      data={data}
      icon={<LuFlag className='inline mr-2 text-swishjam' size={16} />}
      includeBottomHandle={false}
      title='End of Automation'
    />
  )
});