'use client'

import { AlertTriangleIcon, CheckIcon, LoaderIcon } from 'lucide-react';
import ContextMenuable from '@/components/utils/ContextMenuable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Handle, Position } from 'reactflow';
import Logo from '@/components/Logo';
import { LuPencil, LuTrash } from "react-icons/lu";
import { memo } from 'react';
import { NODE_WIDTH } from "@/lib/automations-helpers";
import { Tooltipable } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { prettyDateTime } from '@/lib/utils/timeHelpers';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';
import WarningBanner from '../WarningBanner';

export default memo(({
  id,
  canDelete = true,
  EditComponent,
  data = {},
  dialogFullWidth = true,
  icon,
  includeTopHandle = true,
  includeBottomHandle = true,
  onEditClick,
  requiredData = [],
  showWarningWhenNoEntryPointEvent = true,
  title,
  children
}) => {
  const { executionStepResults = {} } = data;

  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const { updateNode, deleteNode } = useAutomationBuilder();
  const { selectedEntryPointEventName, zoomToEntryPoint, zoomToNodeId, isLoading } = useAutomationBuilder();

  const isInvalid = requiredData.some(key => !data[key]);
  const maybeBorderClasses = executionStepResults.error_message
    ? 'border-l-4 border-l-red-500'
    : executionStepResults.completed_at
      ? 'border-l-4 border-l-green-500'
      : executionStepResults.started_at
        ? 'border-l-4 border-l-blue-500'
        : '';
  const isExecutionResult = Object.keys(executionStepResults).length > 0;

  const contextMenuItems = []
  if (EditComponent || onEditClick) {
    const onClick = onEditClick ? e => setTimeout(() => onEditClick(e), 100) : () => setEditModalIsOpen(true)
    contextMenuItems.push({ label: 'Edit', icon: LuPencil, onClick })
  }
  if (canDelete) {
    if (EditComponent || onEditClick) contextMenuItems.push('seperator')
    contextMenuItems.push({ label: 'Delete', icon: LuTrash, onClick: () => deleteNode(id), className: 'text-red-400 hover:bg-accent' })
  }

  useEffect(() => {
    if (!editModalIsOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = ''
      }, 500)
    }
  }, [editModalIsOpen])

  return (
    <>
      <ContextMenuable items={contextMenuItems}>
        <div
          className={`nodrag nopan card text-left align-top cursor-pointer hover:border-swishjam hover:shadow-sm transition-all ${maybeBorderClasses}`}
          onClick={() => zoomToNodeId(id)}
          onDoubleClick={e => onEditClick ? setTimeout(() => onEditClick(e), 100) : setEditModalIsOpen(true)}
          style={{ width: NODE_WIDTH, pointerEvents: 'all' }}
        >
          {isLoading &&
            <div className='absolute top-0 right-0 left-0 bottom-0 cursor-wait rounded-md'>
              <div className='w-full h-full bg-gray-200 animate-pulse opacity-70 cursor-wait' />
              <Logo className='h-6 w-6 animate-bounce bottom-0 right-0 top-0 left-0 m-auto absolute' />
            </div>
          }
          <div className='flex items-center justify-between space-x-2'>
            <div className='inline-flex items-center space-x-2'>
              {icon}
              <span className='text-md font-medium'>{title}</span>
            </div>
            <div className='inline-flex items-center justify-end space-x-2'>
              {executionStepResults.error_message && (
                <Tooltipable content={executionStepResults.error_message}>
                  <div className='p-1 rounded-full bg-red-100 hover:bg-red-200 transition-all'>
                    <AlertTriangleIcon className='h-4 w-4 text-red-700' />
                  </div>
                </Tooltipable>
              )}
              {executionStepResults.completed_at && !executionStepResults.error_message && (
                <Tooltipable content={`Completed on ${prettyDateTime(executionStepResults.completed_at)}`}>
                  <div className='p-1 rounded-full bg-green-100 hover:bg-green-200 transition-all'>
                    <CheckIcon className='h-4 w-4 text-green-700' />
                  </div>
                </Tooltipable>
              )}
              {executionStepResults.started_at && !executionStepResults.completed_at && !executionStepResults.error_message && (
                <Tooltipable content={`Started on ${prettyDateTime(executionStepResults.started_at)}`}>
                  <div className='p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-all'>
                    <LoaderIcon className='h-4 w-4 text-blue-700 animate-spin' />
                  </div>
                </Tooltipable>
              )}

              {isInvalid && !EditComponent && !isExecutionResult && (
                <Tooltipable content='This step is incomplete.'>
                  <div className='p-1 rounded bg-yellow-100 hover:bg-yellow-200 transition-all'>
                    <AlertTriangleIcon className='text-yellow-700 h-4 w-4' />
                  </div>
                </Tooltipable>
              )}
              {(canDelete || EditComponent) && !isExecutionResult && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={e => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    asChild
                  >
                    <div className='rounded hover:bg-gray-100 transition-colors cursor-pointer'>
                      <EllipsisVerticalIcon className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
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
                    {canDelete && (
                      <DropdownMenuGroup>
                        {(EditComponent || onEditClick) && <DropdownMenuSeparator />}
                        <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent" onClick={() => deleteNode(id)}>
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
          {isInvalid && EditComponent && !isExecutionResult && (
            <WarningBanner>
              <div>
                <span className='block'>This step is incomplete.</span>
                <span onClick={() => setEditModalIsOpen(true)} className='text-xs cursor-pointer hover:underline'>Complete configuration.</span>
              </div>
            </WarningBanner>
          )}
          {(!isInvalid || !EditComponent) && children && (
            <div className='mt-4'>
              {children}
            </div>
          )}

          {includeTopHandle && (
            <Handle
              type="target"
              isConnectable={false}
              position={Position.Top}
              style={{ background: '#b1b1b7' }}
            />
          )}
          {includeBottomHandle && (
            <Handle
              type="source"
              isConnectable={false}
              position={Position.Bottom}
              style={{ background: '#b1b1b7' }}
            />
          )}
        </div>
      </ContextMenuable>

      {EditComponent && !isExecutionResult && (
        <Dialog open={editModalIsOpen} onOpenChange={() => setEditModalIsOpen(false)}>
          <DialogContent fullWidth={dialogFullWidth}>
            <DialogHeader>
              <DialogTitle className='flex items-center space-x-2'>
                {icon}
                <span>{title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className='mt-4'>
              {showWarningWhenNoEntryPointEvent && !selectedEntryPointEventName && (
                <WarningBanner>
                  <div className='ml-4 text-sm'>
                    <span className='block'>You have not selected the event which triggers this automation.</span>
                    <span
                      className='cursor-pointer hover:underline'
                      onClick={() => {
                        setEditModalIsOpen(false)
                        setTimeout(() => {
                          zoomToEntryPoint()
                        }, 250)
                      }}
                    >
                      Select an entry point event.
                    </span>
                  </div>
                </WarningBanner>
              )}
              <EditComponent
                data={data}
                onSave={newData => {
                  toast.success("Automation Step updated.")
                  updateNode(id, newData)
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