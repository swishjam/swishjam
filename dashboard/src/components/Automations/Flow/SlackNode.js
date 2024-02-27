'use client'

import { useState } from 'react'
import ReactFlow, {
  Handle,
  Position,
} from 'reactflow';
import { memo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link";
import Logo from '@components/Logo'
import {
  LuPause, LuPlay,
  LuPencil, LuTrash, LuSettings,
  LuGitCommit, LuSplit, LuMousePointerClick,
  LuMegaphone,
} from "react-icons/lu";
import { ScrollTextIcon } from "lucide-react";
const SlackIcon = ({className}) => (<img src={'/logos/slack.svg'} className={className} />)

import { ComboboxEvents } from "@/components/ComboboxEvents";

const SlackNode = memo(({ data }) => {
  const { content, onChange, width, height } = data;
  const [dialogOpen, setDialogOpen] = useState(false)
  const onDelete = (id) => {}


  return (
    <div style={{ width }} className='bg-white border border-gray-200 shadow-sm p-4 rounded-md overflow-hidden text-left align-top'>
      <p className='text-md font-medium leading-none flex items-center mb-1'>
        <SlackIcon className="h-4 w-4 mr-2"/>
        Send Slack Message 
      </p>
      {/* <hr className='mt-3 border-1 border-gray-100 w-full'/>  */}
      <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto mt-5 w-full truncate text-ellipsis">
        ✨ Added Seat ✨
      </h2>

      <div className="flex items-center gap-x-1.5">
        <LuMegaphone className="h-5 w-5" />
        <h2 className="truncate text-ellipsis w-full min-w-0 text-xs font-semibold leading-6 text-gray-600">
          #testing-slack adfa sdfa sdf asd fa sdf asd fas
        </h2>
      </div>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='absolute top-4 right-4'>
            <LuSettings className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit border-zinc-200 shadow-sm border-sm" align='end'>
          <DropdownMenuItem className='cursor-pointer hover:bg-accent' onClick={() => setDialogOpen(true)}>
            <LuPencil className='h-4 w-4 inline-block mr-2' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent" onClick={() => onDelete(trigger.id)}>
              <LuTrash className='h-4 w-4 inline-block mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>


      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <DialogContent className="min-w-full m-8 p-8">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

     
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default SlackNode;