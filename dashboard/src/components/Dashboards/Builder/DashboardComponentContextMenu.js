import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { TrashIcon } from "@heroicons/react/24/outline"

export default function ContextMenuableComponent({ children, isTriggerable, onDelete }) {
  if (!isTriggerable) return children;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className='group pl-4 pr-8 cursor-pointer' onClick={onDelete}>
          <TrashIcon className="h-5 w-5 mr-2 text-gray-400 group-hover:text-red-400 transition-colors duration-500" />
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
