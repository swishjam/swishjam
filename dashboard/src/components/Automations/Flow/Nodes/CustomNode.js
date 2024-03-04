'use client'

import { useState, useEffect } from 'react'
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LuPencil, LuTrash, LuSettings } from "react-icons/lu";
import { NODE_WIDTH } from '../FlowHelpers';

export default memo(({
  id,
  title,
  icon,
  width = NODE_WIDTH,
  onDelete,
  onEdit,
  includeTopHandle = true,
  includeBottomHandle = true,
  children
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const allNodes = useNodes();
  const allEdges = useEdges();

  useEffect(() => {
    if (!dialogOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = ''
      }, 500)
    }
  }, [dialogOpen])

  return (
    <div style={{ width, pointerEvents: 'all' }} className='nodrag nopan card text-left align-top cursor-default'>
      <div className='flex items-center space-x-2'>
        {icon}
        <span className='text-md font-medium'>{title}</span>
      </div>
      {children && (
        <div className='mt-4'>
          {children}
        </div>
      )}
      {(onDelete || onEdit) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='absolute top-4 right-4'>
              <LuSettings className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit border-zinc-200 shadow-sm border-sm" align='end'>
            {onEdit && (
              <DropdownMenuItem className='cursor-pointer hover:bg-accent' onClick={() => setDialogOpen(true)}>
                <LuPencil className='h-4 w-4 inline-block mr-2' />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuGroup>
                {onEdit && <DropdownMenuSeparator />}
                <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent" onClick={() => onDelete(id, allNodes, allEdges)}>
                  <LuTrash className='h-4 w-4 inline-block mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {includeTopHandle && <Handle type="target" position={Position.Top} />}
      {includeBottomHandle && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
});