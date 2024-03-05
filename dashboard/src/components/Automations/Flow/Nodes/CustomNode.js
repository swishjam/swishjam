'use client'

import { AlertTriangleIcon } from 'lucide-react';
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LuPencil, LuTrash, LuSettings } from "react-icons/lu";
import { memo } from 'react';
import { NODE_WIDTH } from "@/lib/automations-helpers";
import { Tooltipable } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';

export default memo(({
  id,
  EditComponent,
  data = {},
  icon,
  includeTopHandle = true,
  includeBottomHandle = true,
  onEditClick,
  requiredData = [],
  title,
  children
}) => {
  const { onDelete, onUpdate } = data;

  const allNodes = useNodes();
  const allEdges = useEdges();
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const isInvalid = requiredData.some(key => !data[key]);

  useEffect(() => {
    if (!editModalIsOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = ''
      }, 500)
    }
  }, [editModalIsOpen])

  return (
    <>
      <div style={{ width: NODE_WIDTH, pointerEvents: 'all' }} className='nodrag nopan card text-left align-top cursor-default'>
        <div className='flex items-center justify-between space-x-2'>
          <div className='inline-flex items-center space-x-2'>
            {icon}
            <span className='text-md font-medium'>{title}</span>
          </div>
          <div className='inline-flex items-center justify-end space-x-2'>
            {isInvalid && !EditComponent && (
              <Tooltipable content='This step is incomplete.'>
                <div className='p-1 rounded bg-yellow-100 hover:bg-yellow-200 transition-all'>
                  <AlertTriangleIcon className='text-yellow-700 h-4 w-4' />
                </div>
              </Tooltipable>
            )}
            {(onDelete || EditComponent) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className=''>
                    <LuSettings className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit border-zinc-200 shadow-sm border-sm" align='end'>
                  {(EditComponent || onEditClick) && (
                    <DropdownMenuItem
                      className='cursor-pointer hover:bg-accent'
                      onClick={e => onEditClick ? onEditClick(e) : setEditModalIsOpen(true)}
                    >
                      <LuPencil className='h-4 w-4 inline-block mr-2' />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuGroup>
                      {EditComponent && <DropdownMenuSeparator />}
                      <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent" onClick={() => onDelete(id, allNodes, allEdges)}>
                        <LuTrash className='h-4 w-4 inline-block mr-2' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {isInvalid && EditComponent && (
          <div className='text-xs flex items-center space-x-4 mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded transition-colors'>
            <AlertTriangleIcon className='h-6 w-6' />
            <div>
              <span className='block'>This step is incomplete.</span>
              <span onClick={() => setEditModalIsOpen(true)} className='text-xs cursor-pointer mx-1 hover:underline'>Complete configuration.</span>
            </div>
          </div>
        )}
        {(!isInvalid || !EditComponent) && children && (
          <div className='mt-4'>
            {children}
          </div>
        )}

        {includeTopHandle && <Handle type="target" position={Position.Top} />}
        {includeBottomHandle && <Handle type="source" position={Position.Bottom} />}
      </div>

      {EditComponent && (
        <Dialog open={editModalIsOpen} onOpenChange={() => setEditModalIsOpen(false)}>
          <DialogContent fullWidth={true}>
            <DialogHeader>
              <DialogTitle className='flex items-center space-x-2'>
                {icon}
                <span>{title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className='mt-4'>
              <EditComponent
                data={data}
                onSave={newData => {
                  toast.success("Automation Step updated.")
                  onUpdate({ id, data: { ...newData, onDelete, onUpdate }, currentNodes: allNodes })
                  setEditModalIsOpen(false)
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});