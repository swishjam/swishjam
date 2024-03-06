import { Panel } from "reactflow"
import Link from "next/link"
import { LuArrowLeft } from "react-icons/lu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SaveIcon, TestTube2Icon } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function SidePanel({ automationName, onAutomationNameChange, onTestExecutionClick, isLoading, onSave, title }) {
  return (
    <Panel position="top-left">
      <div className='w-80 p-4 ml-6 mt-6 bg-white border border-gray-200 rounded-md mb-6'>
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations"
          >
            <LuArrowLeft className='inline mr-1' size={12} />
            Back to all Automation Flows
          </Link>
          <h1 className="text-lg font-medium text-gray-700 mb-0">{title}</h1>
        </div>
        <p className='text-sm font-medium leading-none flex items-center mb-1 mt-6'>Automation Name</p>
        <Input className='w-full' value={automationName} onChange={e => onAutomationNameChange(e.target.value)} />
        <Button
          disabled={isLoading}
          className="mt-4 w-full flex items-center space-x-2"
          variant='swishjam'
          onClick={onSave}
        >
          {isLoading
            ? <LoadingSpinner color='white' size={6} />
            : (
              <>
                <SaveIcon className='h-4 w-4' />
                <span>Save Automation</span>
              </>
            )}
        </Button>
        <Button
          className="mt-2 w-full flex items-center space-x-2"
          disabled={isLoading}
          onClick={onTestExecutionClick}
          variant='outline'
        >
          {isLoading
            ? <LoadingSpinner size={6} />
            : (
              <>
                <TestTube2Icon className='h-4 w-4' />
                <span>Run Test Automation</span>
              </>
            )}
        </Button>
      </div>
    </Panel>
  )
}