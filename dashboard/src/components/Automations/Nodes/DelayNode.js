import { XIcon } from "lucide-react";
import CustomNode from "./CustomNode";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { LuAlarmClock } from "react-icons/lu";
import { memo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react";
import { PopoverAnchor } from "@radix-ui/react-popover";
import useAutomationBuilder from "@/hooks/useAutomationBuilder";
import { Button } from "@/components/ui/button";
import WarningBanner from "../WarningBanner";
import { prettyDateTime } from "@/lib/utils/timeHelpers";

const EditPopover = ({ id, data, children, onClose }) => {
  const { delay_amount, delay_unit } = data;
  const { updateNode } = useAutomationBuilder();

  const [editedDelayAmount, setEditedDelayAmount] = useState(delay_amount);
  const [editedDelayUnit, setEditedDelayUnit] = useState(delay_unit);

  return (
    <>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverContent className='pt-10 px-4'>
        <h3 className='text-sm font-medium leading-none flex items-center mb-2'>Delay Amount</h3>
        <button
          className='rounded hover:bg-gray-100 transition-colors p-1 absolute top-2 right-2'
          onClick={onClose}
        >
          <XIcon className='h-4 w-4' />
        </button>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!editedDelayAmount || !editedDelayUnit) return;
            updateNode(id, { delay_amount: parseInt(editedDelayAmount), delay_unit: editedDelayUnit });
            onClose();
          }}
        >
          <div className='flex space-x-1'>
            <Input
              min={1}
              noRing={true}
              onChange={e => setEditedDelayAmount(e.target.value)}
              placeholder='Delay Amount'
              type='number'
              value={editedDelayAmount}
            />
            <Select defaultValue={editedDelayUnit} onValueChange={val => setEditedDelayUnit(val)}>
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
          <Button
            className='w-full mt-2'
            disabled={!editedDelayAmount || !editedDelayUnit}
            type='submit'
            variant='swishjam'
          >
            Save
          </Button>
        </form>
      </PopoverContent>
    </>
  )
}

export default memo(({ id, data }) => {
  const { delay_amount, delay_unit, executionStepResults = {} } = data;
  const [editPopoverIsOpen, setEditPopoverIsOpen] = useState(false);

  const displayExecutionResult = Object.keys(executionStepResults).length > 0;

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
          {displayExecutionResult ? (
          executionStepResults.execution_data?.executed_delayed_execution_at ? (
            <p className='text-sm text-gray-700 italic mb-2'>
              Resumed automation on <DottedUnderline>{prettyDateTime(executionStepResults.execution_data.executed_delayed_execution_at)}</DottedUnderline>.
            </p>
          ) : (
            <p className='text-sm text-gray-700 italic mb-2'>
              Currently delaying next step, scheduled to resume on <DottedUnderline>{prettyDateTime(executionStepResults.execution_data.scheduled_to_be_executed_at)}</DottedUnderline>.
            </p>
          )
          ) : (
            delay_amount && delay_unit
              ? (
                <p className='text-sm text-gray-700'>
                  Wait
                  <EditPopover id={id} data={data} onClose={() => setEditPopoverIsOpen(false)}>
                    <DottedUnderline cursor='pointer' className='mx-1'>{delay_amount} {delay_amount === '1' ? delay_unit.slice(0, delay_unit.length - 1) : delay_unit}</DottedUnderline>
                  </EditPopover>
                  before running the next step.
                </p>
              ) : (
                <WarningBanner>
                  <>
                    <span className='block'>This step is incomplete.</span>
                    <EditPopover id={id} data={data} onClose={() => setEditPopoverIsOpen(false)}>
                      <span className='text-xs cursor-pointer hover:underline'>Complete configuration.</span>
                    </EditPopover>
                  </>
                </WarningBanner>
              )
          )}
        </CustomNode>
      </PopoverAnchor>
    </Popover>
  );
})