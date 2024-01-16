import { useState } from 'react'
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SettingsDropdown({ options, onSettingChange = () => { } }) {
  const [open, setOpen] = useState()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="outline-0 ring-0">
        <EllipsisVerticalIcon className={`${open ? '!opacity-100' : ''} outline-0 ring-0 active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 duration-300 transition h-5 w-5 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        {options.map((option, index) => (
          <DropdownMenuItem
            key={index}
            className={`cursor-pointer ${option.enabled ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
            onClick={() => {
              const valueChangedFrom = option.enabled;
              const valueChangedTo = !option.enabled;
              option.enabled = valueChangedTo;
              option.onChange(valueChangedTo)
              onSettingChange({ attribute: option.attribute, valueChangedFrom, valueChangedTo })
            }}
            onSelect={e => e.preventDefault()}
          >
            {option.enabled && <CheckCircleIcon className='h-4 w-4 absolute' />}
            <span className='mx-6'>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}