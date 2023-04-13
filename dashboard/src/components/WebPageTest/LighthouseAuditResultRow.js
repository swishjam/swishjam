import { useState } from "react"
import { bytesToHumanFileSize, formattedMsOrSeconds } from "@/lib/utils"
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import MarkdownText from "@components/MarkdownText";

export default function AuditResultRow({ title, icon, description, details, numericValue, numericUnit, displayValue, scoreDisplayMode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className='border border-gray-200 rounded-md p-4 mb-4' key={title}>
      <div className='flex justify-between cursor-pointer' onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className='flex items-center'>
          {isCollapsed ? <ArrowsPointingOutIcon className='h-5 w-5 inline-block text-gray-400' /> : <ArrowsPointingInIcon className='h-5 w-5 inline-block text-gray-400' />}
          {icon}
          <h3 className='text-lg font-bold inline-block ml-2'>
            {title} ({scoreDisplayMode})
          </h3>
        </div>
        <h3 className="text-lg font-extralight">
          {['millisecond', 'seconds'].includes(numericUnit) ? `${formattedMsOrSeconds(numericValue)} in estimated savings` : `${displayValue || ''}`}
        </h3>
      </div>
      <div className={isCollapsed ? 'hidden' : 'mt-4'}>
        <MarkdownText text={description} />
        <div className='mt-4'>
          <div className={`grid grid-cols-${details?.headings?.length + 1}`}>
            {(details?.headings || []).map(({ label }, i) => (
              <div className={`${i === 0 ? 'col-span-2' : 'col-span-1'} py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3`}>{label}</div>
            ))}
          </div>
          {(details?.items || []).map((itemDetails, i) => (
            <div className={`grid grid-cols-${details?.headings?.length + 1} ${i % 2 === 0 ? 'bg-gray-100' : undefined}`} key={i}>
              {(details?.headings || []).map(({ key, valueType }, j) => (
                <div className={`truncate py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3 ${j === 0 ? 'col-span-2' : 'col-span-1'}`}>
                  {['text', 'url'].includes(valueType) 
                    ? itemDetails[key]
                    : ['bytes'].includes(valueType)
                      ? bytesToHumanFileSize(itemDetails[key])
                      : ['node'].includes(valueType)
                        ? itemDetails[key]?.selector
                        : ['timespanMs', 'ms'].includes(valueType)
                          ? formattedMsOrSeconds(itemDetails[key])
                          : ['numeric'].includes(valueType) 
                            ? parseFloat(itemDetails[key]).toFixed(4)
                            : JSON.stringify(itemDetails[key]) } 
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}