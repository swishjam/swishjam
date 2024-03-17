import { CheckCircleIcon } from "lucide-react"

export default function ExecutedAutomationResultsBanner({ numExecutedSteps, numSteps }) {
  return (
    <div className='bg-green-100 p-4 rounded-md text-green-600 flex items-center space-x-2'>
      <div className='w-full flex items-center bg-green-100 text-green-600 py-2 px-4 space-x-2'>
        <div className='flex-shrink-0'>
          <CheckCircleIcon className='h-6 w-6' />
        </div>
        <p className='text-sm font-semibold'>
          Automation executed {numExecutedSteps} out of {numSteps} automation steps.
        </p>
      </div>
    </div>
  )
}