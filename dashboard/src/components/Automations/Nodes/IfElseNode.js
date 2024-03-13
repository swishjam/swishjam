import { memo } from "react";
import CustomNode from "./CustomNode";
import { LuSplit } from "react-icons/lu";

export default memo(({ data }) => {
  return (
    <CustomNode
      icon={<LuSplit className='h-5 w-5 text-gray-700' />}
      title='If / Else Statement'
    >
      <>IF!</>
    </CustomNode>
  )
});