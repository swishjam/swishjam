import DottedUnderline from "@/components/utils/DottedUnderline";
import CustomNode from "./CustomNode";
import { LuAlarmClock } from "react-icons/lu";

export default function DelayNode({ id, data }) {
  return (
    <CustomNode
      id={id}
      icon={<LuAlarmClock className='h-5 w-5' />}
      title='Delay'
      width={data.width}
      onDelete={data.onDelete}
    >
      <p className='text-sm text-gray-700'>
        Wait <DottedUnderline>{data.delay_amount} {data.delay_unit}</DottedUnderline> before resuming the automation.
      </p>
    </CustomNode>
  );
}