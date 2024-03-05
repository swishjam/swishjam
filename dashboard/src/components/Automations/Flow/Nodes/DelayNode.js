import { AlertTriangleIcon } from "lucide-react";
import CustomNode from "./CustomNode";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { LuAlarmClock } from "react-icons/lu";
import { memo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNodes } from "reactflow";
import { useState } from "react";
import { PopoverAnchor } from "@radix-ui/react-popover";

const EditPopover = ({ id, data, children }) => {
  const { delay_amount, delay_unit, onUpdate } = data;
  const allNodes = useNodes();

  const update = newData => onUpdate({ id, data: { ...data, ...newData }, currentNodes: allNodes });

  return (
    <>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverContent>
        <div className='flex space-x-1'>
          <Input
            min={1}
            noRing={true}
            onChange={e => update({ delay_amount: e.target.value })}
            placeholder='Delay Amount'
            type='number'
            value={delay_amount}
          />
          <Select defaultValue={delay_unit} onValueChange={val => update({ delay_unit: val })}>
            <SelectTrigger noRing={true} className="w-[180px]">
              <SelectValue placeholder="Time unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </>
  )
}

export default memo(({ id, data }) => {
  const { delay_amount, delay_unit } = data;
  const [editPopoverIsOpen, setEditPopoverIsOpen] = useState(false);

  return (
    <Popover open={editPopoverIsOpen} onOpenChange={setEditPopoverIsOpen}>
      <PopoverAnchor>
        <CustomNode
          id={id}
          onEditClick={e => {
            e.stopPropagation()
            // without setTimeout the popover will close immediately because of the click event?
            setTimeout(() => setEditPopoverIsOpen(true), 100)
          }}
          data={data}
          icon={<LuAlarmClock className='h-5 w-5' />}
          requiredData={['delay_amount', 'delay_unit']}
          title='Delay'
        >
          {delay_amount && delay_unit
            ? (
              <p className='text-sm text-gray-700'>
                Wait
                <EditPopover id={id} data={data} open={editPopoverIsOpen} onOpenChange={setEditPopoverIsOpen}>
                  <DottedUnderline cursor='pointer' className='mx-1'>{delay_amount} {delay_amount === '1' ? delay_unit.slice(0, delay_unit.length - 1) : delay_unit}</DottedUnderline>
                </EditPopover>
                before running the next step.
              </p>
            ) : (
              <div className='text-xs flex items-center space-x-4 mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded transition-colors'>
                <AlertTriangleIcon className='h-6 w-6' />
                <div>
                  <span className='block'>This step is incomplete.</span>
                  <EditPopover id={id} data={data} open={editPopoverIsOpen} onOpenChange={setEditPopoverIsOpen}>
                    <span className='text-xs cursor-pointer hover:underline'>Complete configuration.</span>
                  </EditPopover>
                </div>
              </div>
            )}
        </CustomNode>
      </PopoverAnchor>
    </Popover>
  );
})