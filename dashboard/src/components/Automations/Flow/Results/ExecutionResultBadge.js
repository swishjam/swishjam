import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { Tooltipable } from "@/components/ui/tooltip"
import { CalendarClockIcon, CheckIcon, XIcon } from "lucide-react";

export default function ExecutionResultBadge({ executedStep }) {
  switch (executedStep.status) {
    case 'pending':
      return (
        <Tooltipable content={`Automation will continue ${executedStep.execution_data?.scheduled_to_be_executed_at ? prettyDateTime(executedStep.execution_data.scheduled_to_be_executed_at) : 'when the delayed step is complete'}.`}>
          <div className='bg-blue-100 text-blue-700 rounded-full p-1.5 flex items-center justify-center absolute top-1.5 right-2 transition-all hover:bg-blue-200'>
            <CalendarClockIcon className='h-4 w-4' />
          </div>
        </Tooltipable>
      )
    case 'completed':
      return (
        <Tooltipable content={`Completed ${prettyDateTime(executedStep.completed_at, { month: 'short', year: 'none' })}`}>
          <div className='bg-green-100 text-green-700 rounded-full p-1.5 flex items-center justify-center absolute top-1.5 right-2 transition-all hover:bg-green-200'>
            <CheckIcon className='h-4 w-4' />
          </div>
        </Tooltipable>
      )
    case 'failed':
      return (
        <Tooltipable content={`Error: ${executedStep.error_message}`}>
          <div className='bg-red-100 text-red-700 rounded-full p-1.5 flex items-center justify-center absolute top-1.5 right-2 transition-all hover:bg-red-200'>
            <XIcon className='h-4 w-4' />
          </div>
        </Tooltipable>
      )
    default:
      throw new Error('Unhandled status for executed step.')
  }
}