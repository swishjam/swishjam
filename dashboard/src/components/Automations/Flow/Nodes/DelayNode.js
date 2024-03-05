import DottedUnderline from "@/components/utils/DottedUnderline";
import CustomNode from "./CustomNode";
import { LuAlarmClock } from "react-icons/lu";
import { memo } from "react";

export default memo(({ id, data }) => {
  const { delay_amount, delay_unit } = data;
  return (
    <CustomNode
      id={id}
      data={data}
      icon={<LuAlarmClock className='h-5 w-5' />}
      requiredData={['delay_amount', 'delay_unit']}
      title='Delay'
    >
      <p className='text-sm text-gray-700'>
        Wait <DottedUnderline>{delay_amount} {delay_unit}</DottedUnderline> before resuming the automation.
      </p>
    </CustomNode>
  );
})