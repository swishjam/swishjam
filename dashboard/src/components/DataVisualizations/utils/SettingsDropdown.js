import { useState } from 'react'
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { CheckCircleIcon } from 'lucide-react';
import {
  DropdownMenuPortal,
  DropdownMenuSubTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { ExternalLinkIcon } from 'lucide-react';
import useDataVisualizationSettings from '@/hooks/useDataVisualizationSettings';

export default function SettingsDropdown({ dataVisualizationId }) {
  const [open, setOpen] = useState()
  const { settings, updateSetting } = useDataVisualizationSettings()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="outline-0 ring-0">
        <EllipsisVerticalIcon className={`${open ? '!opacity-100' : ''} outline-0 ring-0 active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 duration-300 transition h-5 w-5 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        {(settings || []).map((option, index) => {
          if (option.options) {
            return (
              <DropdownMenuSub key={index} className='cursor-pointer'>
                <DropdownMenuSubTrigger className='group'>
                  <span className="mx-6">{option.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {option.options.map((subOption, subIndex) => (
                      <DropdownMenuItem
                        key={subIndex}
                        className={`cursor-pointer ${subOption.value === option.selectedValue ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
                        onClick={() => updateSetting(option.id, subOption.value)}
                      >
                        {subOption.value === option.selectedValue && <CheckCircleIcon className='h-4 w-4 absolute' />}
                        <span className='ml-6 w-full capitalize'>{subOption.label || subOption.value}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )
          } else {
            return (
              <DropdownMenuItem
                key={index}
                className={`group cursor-pointer ${option.enabled ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
                onClick={() => updateSetting(option.id, !option.enabled)}
                onSelect={e => e.preventDefault()}
              >
                <CheckCircleIcon className={`h-4 w-4 absolute ${option.enabled ? 'opacity-100' : 'opacity-0'}`} />
                <span className='mx-6'>{option.label}</span>
              </DropdownMenuItem>
            )
          }
        })}
        {dataVisualizationId && (
          <>
            {(settings || []).length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem className='cursor-pointer hover:text-swishjam' asChild>
              <Link
                href={`/data-visualizations/${dataVisualizationId}`}
                className='flex items-center justify-center'
                target='_blank'
              >
                <span className='mr-2'>View in Data Playground</span>
                <ExternalLinkIcon className='h-4 w-4' />
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu >
  )
}