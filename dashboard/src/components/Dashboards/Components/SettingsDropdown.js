import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { CircleIcon } from "@radix-ui/react-icons"
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SettingsDropdown({ onSettingChange, options }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Cog8ToothIcon className='group-active:opacity-100 group-focus:opacity-100 group-hover:opacity-100 ring-0 opacity-0 duration-500 transition h-5 w-5 text-gray-500 cursor-pointer' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ name, key, isActive }) => (
          <DropdownMenuItem
            key={key}
            className={`cursor-pointer ${isActive ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
            onClick={() => {
              onSettingChange(key)
            }}
          >
            {isActive ? <CheckCircleIcon className='h-4 w-4 absolute' /> : <CircleIcon className='h-4 w-4 absolute' />}
            <span className='mx-6'>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}