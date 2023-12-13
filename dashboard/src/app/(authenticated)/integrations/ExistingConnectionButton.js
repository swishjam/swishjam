import Image from 'next/image';
import { Cog6ToothIcon } from '@heroicons/react/20/solid';
import { PauseCircleIcon, TrashIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ExistingConnectionItem({ img, connection, enabled, onRemoveClick, onDisableClick, onEnableClick, canEdit = true, borderImage = false }) {

  return (
    <li key={connection.id} className={`border-b border-gray-200`}>
      <div className="flex justify-between items-center gap-x-4 py-4">
        <div className='flex items-center gap-x-4'>
          <Image
            src={img}
            alt={connection.name}
            className={`h-12 w-12 flex-none rounded-lg object-cover ${borderImage ? 'bg-white ring-1 ring-gray-900/10' : ''}`}
          />
          <div className="text-sm font-medium leading-6 text-gray-900">
            {connection.name}
            {!enabled && (
              <span className="ml-2 inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 ring-1 ring-inset ring-orange-600/20">
                Disabled
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-white text-slate-900 border border-gray-200 hover:bg-white hover:text-swishjam duration-300 transition-all">
                <Cog6ToothIcon className="h-5 w-5 mr-4" aria-hidden="true" />
                Manage
              </Button> 
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-36" align={'end'}>
              <DropdownMenuLabel>Edit Connection</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {enabled ?
                  <DropdownMenuItem onClick={() => onDisableClick(connection.id)} className="cursor-pointer">
                    <PauseCircleIcon className='h-4 w-4 inline-block mr-2' />
                    Pause
                  </DropdownMenuItem> :
                  <DropdownMenuItem onClick={() => onEnableClick(connection.id)} className="cursor-pointer">
                    <PlayCircleIcon className='h-4 w-4 inline-block mr-2' />
                    Resume
                  </DropdownMenuItem>
                }
                <DropdownMenuItem className="!text-red-400 cursor-pointer" onClick={() => onRemoveClick(connection.id)}>
                  <TrashIcon className='h-4 w-4 inline-block mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </li>
  )
}