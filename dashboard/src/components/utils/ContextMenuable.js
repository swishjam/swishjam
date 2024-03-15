import { ContextMenu, ContextMenuSeparator, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"

export default function ContextMenuable({ children, items, ...props }) {
  if (!items || !items.length) {
    return children
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent {...props} className={`max-w-64 ${props.className || ''}`}>
        {items.map((item, index) => {
          if (item === 'seperator') {
            return <ContextMenuSeparator key={index} />
          } else {
            return (
              <ContextMenuItem className='cursor-pointer pl-2 pr-8' onClick={item.onClick} key={index}>
                <div className={`flex items-center space-x-2 ${item.className}`}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              </ContextMenuItem>
            )
          }
        })}
      </ContextMenuContent>
    </ContextMenu>
  )
}
