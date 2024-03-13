import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"
import { LuArrowLeft } from "react-icons/lu"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FlaskConical, SaveIcon, XIcon } from "lucide-react"
import { useState } from "react"
import useAutomationBuilder from "@/hooks/useAutomationBuilder"

export default function TopPanel({ automationName, onTestExecutionClick, onSave, onAutomationNameSave, height = '75px' }) {
  const { isLoading } = useAutomationBuilder();

  const [editedAutomationName, setEditedAutomationName] = useState(automationName)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <div className="w-full grid grid-cols-3 items-center bg-white border-b border-zinc-200 py-2 px-4" style={{ height }}>
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
                if (!isLoading) {
                  onAutomationNameSave(editedAutomationName)
                  setIsPopoverOpen(false)
                }
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
                disabled={isLoading}
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
          className="flex items-center space-x-2 group"
          disabled={isLoading}
          onClick={onTestExecutionClick}
          variant='outline'
        >
          {isLoading ? <LoadingSpinner size={4} /> : <FlaskConical className='h-4 w-4 transition-all group-hover:rotate-45' />}
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