import { Button } from "@/components/ui/button"
import DottedUnderline from "@/components/utils/DottedUnderline"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"
import { LuArrowLeft } from "react-icons/lu"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SaveIcon, TestTube2Icon, XIcon } from "lucide-react"
import { useState } from "react"

export default function TopPanel({ automationName, onTestExecutionClick, onAutomationNameUpdated, isLoading, onSave }) {
  const [editedAutomationName, setEditedAutomationName] = useState(automationName)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <div className="absolute -translate-x-1/2 z-10 top-5 w-[95%] left-1/2 right-1/2 mx-auto grid grid-cols-3 items-center bg-white rounded-md border border-zinc-200 py-2 px-4">
      <div>
        <Link
          className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center'
          href="/automations"
        >
          <LuArrowLeft className='inline mr-1' size={12} />
          Back to all Automations
        </Link>
      </div>
      <div className='flex items-center m-auto'>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger>
            <div className='cursor-pointer  font-medium p-2 px-4 hover:bg-gray-100 transition-all duration-500 rounded-md'>
              {automationName}
            </div>
          </PopoverTrigger>
          <PopoverContent className='relative px-4 pt-8'>
            <PopoverClose className='absolute top-2 right-2 rounded hover:bg-gray-100 transition-all cursor-pointer p-1 flex items-center justify-center'>
              <XIcon className='h-4 w-4' />
            </PopoverClose>
            <form
              onSubmit={e => {
                e.preventDefault();
                onAutomationNameUpdated(editedAutomationName)
                setIsPopoverOpen(false)
              }}
            >
              <Label className='text-xs font-medium leading-none flex items-center mb-1'>Automation Name</Label>
              <Input
                className='w-full'
                value={editedAutomationName}
                noRing={true}
                onChange={e => setEditedAutomationName(e.target.value)}
              />
              <Button
                className="mt-4 w-full flex items-center space-x-2"
                variant='swishjam'
                type='submit'
              >
                Save
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
      <div className='flex items-center justify-end space-x-2'>
        <Button
          className="flex items-center space-x-2"
          disabled={isLoading}
          onClick={onTestExecutionClick}
          variant='outline'
        >
          {isLoading ? <LoadingSpinner size={4} /> : <TestTube2Icon className='h-4 w-4' />}
          <span>Run Test Automation</span>
        </Button>
        <Button
          className="flex items-center space-x-2"
          disabled={isLoading}
          onClick={onSave}
          variant='swishjam'
        >
          {isLoading ? <LoadingSpinner color='white' size={4} /> : <SaveIcon className='h-4 w-4' />}
          <span>Save Automation</span>
        </Button>
      </div>
    </div>
  )
}