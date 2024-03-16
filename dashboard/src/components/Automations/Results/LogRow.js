import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { CheckCircleIcon, InfoIcon, TriangleIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";

export default function LogRow({ log }) {
  const [jsonIsExpanded, setJsonIsExpanded] = useState(false);

  if (log.level === 'json') {
    const parsedJSON = JSON.parse(log.message);
    return (
      <div
        className='flex items-center justify-between px-2 py-0.5 hover:bg-gray-500 transition-all text-white cursor-pointer active:scale-[99%]'
        onClick={() => setJsonIsExpanded(!jsonIsExpanded)}
      >
        <span>
          <span className='flex items-center'>
            <TriangleIcon className={`h-2 w-2 inline-block mr-2 transition-all ${jsonIsExpanded ? 'rotate-180' : 'rotate-90'}`} /> {'JSON {}'}
          </span>
          {jsonIsExpanded && (
            <div>
              {Object.keys(parsedJSON).map((key, i) => (
                <div key={i} className='flex items-center space-x-1'>
                  <span className='text-gray-300 mr-1'>{key}:</span>
                  <pre className='whitespace-pre-wrap inline-block truncate'>{JSON.stringify(parsedJSON[key], null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </span>
        <span>
          {prettyDateTime(log.timestamp, { seconds: 'numeric' })}
        </span>
      </div>
    )
  } else {
    const textColor = { success: 'text-green-500', error: 'text-red-600' }[log.level]
    return (
      <div className={`flex items-center justify-between px-2 py-0.5 hover:bg-gray-500 transition-colors cursor-default ${textColor || 'text-white '}`}>
        <span className='flex items-center'>
          {log.level === 'info' && <InfoIcon className='h-3 w-3 mr-1' />}
          {log.level === 'success' && <CheckCircleIcon className='h-3 w-3 mr-1' />}
          {log.level === 'error' && <XCircleIcon className='h-3 w-3 mr-1' />}
          {log.message}
        </span>
        <span>
          {prettyDateTime(log.timestamp, { seconds: 'numeric' })}
        </span>
      </div>
    )
  }
}