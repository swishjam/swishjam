import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { CheckCircleIcon, ChevronRightIcon, CircleAlertIcon, InfoIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";

export default function LogRow({ log, icon, color, timestampFormatterOptions = { seconds: 'numeric', milliseconds: true } }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandable = log.metadata && (Array.isArray(log.metadata) ? log.metadata : Object.keys(log.metadata)).length > 0
  const IconForLog = icon || {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InfoIcon,
    warn: CircleAlertIcon,
  }[log.level]
  const textColorClass = color ? `text-${color}-600` : { success: 'text-green-600', error: 'text-red-600', warn: 'text-yellow-600' }[log.level] || 'text-black';
  const bgColorClass = color ? `bg-${color}-100 hover:bg-${color}-200` : { success: 'bg-green-100 hover:bg-green-200', error: 'bg-red-100 hover:bg-red-200', warn: 'bg-yellow-100 hover:bg-yellow-200' }[log.level] || 'bg-white hover:bg-gray-100'

  return (
    <div
      className={`grid grid-cols-4 items-center justify-between px-2 py-1 transition-colors ${isExpandable ? 'cursor-pointer' : 'cursor-default'} ${bgColorClass} ${textColorClass}`}
      onClick={() => isExpandable && setIsExpanded(!isExpanded)}
    >
      <>
        <span className='flex items-center col-span-3 text-sm'>
          {IconForLog && <IconForLog className='h-3 w-3 mr-2' />}
          {isExpandable && <ChevronRightIcon className={`h-3 w-3 mr-2 transition-all ${isExpanded ? 'rotate-90' : ''}`} />}
          {log.message}
        </span>
        <span className='font-mono text-end text-xs'>
          {prettyDateTime(log.timestamp, timestampFormatterOptions)}
        </span>
        {isExpandable && (
          <div className={`col-span-4 transition-all overflow-hidden ${isExpanded ? 'h-fit pl-12 py-2' : 'h-0'}`}>
            <span className='text-xs font-semibold'>
              {/no automation step satisfies the specified conditions|satisfied conditions:/i.test(log.message) ? 'Conditions:' : 'Response:'}
            </span>
            {Object.keys(log.metadata).map((key, i) => (
              <div key={i} className={`flex items-center space-x-1 mt-1 pl-2 text-xs font-mono ${textColorClass}`}>
                <span className='whitespace-pre-wrap truncate mr-1'>{key}:</span>
                <span className='whitespace-pre-wrap truncate'>{JSON.stringify(log.metadata[key], null, 2)}</span>
              </div>
            ))}
          </div>
        )}
      </>
    </div>
  )
}