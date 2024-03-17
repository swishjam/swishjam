import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { CheckCircleIcon, ChevronRightIcon, CircleAlertIcon, InfoIcon, TriangleIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";

const ExpandableJsonRow = ({ log, timestampFormatterOptions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsedJSON = JSON.parse(log.message);
  return (
    <div
      className='grid grid-cols-4 items-center justify-between text-sm px-2 py-0.5 hover:bg-gray-500 transition-colors cursor-pointer text-white'
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <>
        <span className='flex items-center col-span-3'>
          <ChevronRightIcon className={`h-3 w-3 mr-2 transition-all ${isExpanded ? 'rotate-90' : ''}`} />
          JSON {'{}'}
        </span>
        <span className='font-mono text-end'>
          {prettyDateTime(log.timestamp, timestampFormatterOptions)}
        </span>
      </>
      <div className={`col-span-4 transition-all overflow-hidden ${isExpanded ? 'h-fit px-4 py-0.5' : 'h-0'}`}>
        {Object.keys(parsedJSON).map((key, i) => (
          <div key={i} className='flex items-center space-x-1 text-white'>
            <span className='text-gray-300 mr-1'>{key}:</span>
            <pre className='whitespace-pre-wrap inline-block truncate'>{JSON.stringify(parsedJSON[key], null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogRow({ log, icon, textColor, timestampFormatterOptions = { seconds: 'numeric', milliseconds: true } }) {
  const IconForLog = icon || {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InfoIcon,
    warning: CircleAlertIcon,
  }[log.level]
  const textClass = textColor || { success: 'text-green-500', error: 'text-red-600' }[log.level] || 'text-white';

  if (log.level === 'json') {
    return <ExpandableJsonRow log={log} timestampFormatterOptions={timestampFormatterOptions} />
  } else {
    return (
      <div className={`grid grid-cols-4 items-center justify-between text-sm px-2 py-0.5 hover:bg-gray-500 transition-colors cursor-default ${textClass}`}>
        <>
          <span className='flex items-center col-span-3'>
            {IconForLog && <IconForLog className='h-3 w-3 mr-2' />}
            {log.message}
          </span>
          <span className='font-mono text-end'>
            {prettyDateTime(log.timestamp, timestampFormatterOptions)}
          </span>
        </>
      </div>
    )
  }
}