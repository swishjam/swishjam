import { AreaChartIcon, CheckCircleIcon, ExternalLinkIcon } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger
} from "@/components/ui/context-menu"
import useDataVisualizationSettings from "@/hooks/useDataVisualizationSettings";
import { TrashIcon } from "@heroicons/react/24/outline"
import Link from "next/link";

export default function DataVisualizationContextMenu({ children, isTriggerable, onDelete, dataVisualizationId }) {
  const { settings, updateSetting } = useDataVisualizationSettings();
  if (!isTriggerable || (!onDelete && !dataVisualizationId && (!settings || settings.length === 0))) return children;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {(settings || []).map((option, index) => {
          if (option.options) {
            return (
              <ContextMenuSub key={index} className='cursor-pointer'>
                <ContextMenuSubTrigger className='group'>
                  <span className="mx-6">{option.label}</span>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {option.options.map((subOption, subIndex) => (
                    <ContextMenuItem
                      key={subIndex}
                      className={`cursor-pointer ${subOption.value === option.selectedValue ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
                      onClick={() => updateSetting(option.id, subOption.value)}
                    >
                      {subOption.value === option.selectedValue && <CheckCircleIcon className='h-4 w-4 absolute' />}
                      <span className='ml-6 w-full capitalize'>{subOption.label || subOption.value}</span>
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
            )
          } else {
            return (
              <ContextMenuItem
                key={index}
                className={`group cursor-pointer ${option.enabled ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
                onClick={() => updateSetting(option.id, !option.enabled)}
                onSelect={e => e.preventDefault()}
              >
                {option.enabled && <CheckCircleIcon className='h-4 w-4 absolute' />}
                <span className='ml-6 w-full'>{option.label}</span>
              </ContextMenuItem>
            )
          }
        })}
        {dataVisualizationId && (
          <>
            {(settings || []).length > 0 && <ContextMenuSeparator />}
            <ContextMenuItem className='group cursor-pointer' asChild>
              <Link
                href={`/data-visualizations/${dataVisualizationId}`}
                className='flex items-center'
                target='_blank'
              >
                <AreaChartIcon className='h-4 w-4 absolute text-gray-400 group-hover:text-swishjam transition-colors duration-500' />
                <span className='text-gray-700 ml-6'>View Visualization in Playground</span>
                <ExternalLinkIcon className='h-3 w-3 ml-2' />
              </Link>
            </ContextMenuItem>
          </>
        )}
        {onDelete && (
          <>
            {dataVisualizationId && <ContextMenuSeparator />}
            <ContextMenuItem className='group cursor-pointer' onClick={onDelete}>
              <TrashIcon className="h-4 w-4 absolute text-gray-400 group-hover:text-red-400 transition-colors duration-500" />
              <span className='ml-6 text-gray-700'>Remove from Dashboard</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
