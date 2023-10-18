import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ClipboardDocumentCheckIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"

export default function ContextMenuableComponent({ children, isTriggerable, onEdit, onDuplicate, onDelete }) {
  if (!isTriggerable) return children;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {/* <ContextMenuItem className='pl-4 pr-8' onClick={onEdit}>
          <PencilSquareIcon className="h-5 w-5 mr-2 text-gray-400" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem className='pl-4 pr-8 hover:bg-red-50 hover:text-red-200' onClick={onDuplicate}>
          <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-gray-400" />
          Duplicate
        </ContextMenuItem> */}
        <ContextMenuItem className='pl-4 pr-8 hover:bg-red-50 hover:text-red-200 cursor-pointer' onClick={onDelete}>
          <TrashIcon className="h-5 w-5 mr-2 text-gray-400" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>

  )
}
