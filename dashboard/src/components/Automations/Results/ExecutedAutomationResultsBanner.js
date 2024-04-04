import { CheckCircleIcon, TriangleAlertIcon } from "lucide-react"

export default function ExecutedAutomationResultsBanner({ executedAutomationSteps, numSteps }) {
  const numSuccessfulSteps = executedAutomationSteps.filter(ex => !ex.error_message).length
  const numFailedSteps = executedAutomationSteps.filter(ex => ex.error_message).length

  return (
    <div className={`p-4 rounded-md flex items-center space-x-2 ${numFailedSteps > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
      <div className='w-full flex items-center py-2 px-4 space-x-2'>
        <div className='flex-shrink-0'>
          {numFailedSteps > 0 ? <TriangleAlertIcon className='h-6 w-6' /> : <CheckCircleIcon className='h-6 w-6' />}
        </div>
        <p className='text-sm font-semibold'>
          Automation executed {numSuccessfulSteps} out of {numSteps} automation steps sucessfully.
          {numFailedSteps > 0 && <> {numFailedSteps} steps failed.</>}
        </p>
      </div>
    </div>
  )
}