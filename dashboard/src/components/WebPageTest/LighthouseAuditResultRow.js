import { useState } from "react"
import { bytesToHumanFileSize, formattedMsOrSeconds } from "@/lib/utils"
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import MarkdownText from "@components/MarkdownText";

export default function AuditResultRow({ 
  title, 
  subTitle,
  subTitleColor,
  icon, 
  description, 
  details, 
  numericValue, 
  numericUnit, 
  displayValue, 
  displayVisualEstimatedSavings 
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className='border border-gray-200 rounded-md py-2 px-4 mb-2' key={title}>
      <div className='grid grid-cols-4 flex justify-between cursor-pointer py-2 px-1' onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className={`flex items-center ${displayVisualEstimatedSavings ? 'col-span-2' : 'col-span-3'}`}>
          {icon}
          <h3 className='text-sm inline-block ml-2'>
            {title} {subTitle ? <span className={subTitleColor || 'text-gray-600'}> - {subTitle}</span> : null}
          </h3>
        </div>
        <div className={`grid grid-cols-3 ${displayVisualEstimatedSavings ? 'col-span-2' : 'col-span-1'}`}>
          <div className='col-span-2 flex items-center justify-end overflow-hidden'>
            {displayVisualEstimatedSavings && <div className={`mr-2 h-2 rounded ${details.overallSavingsMs > 999 ? 'bg-red-600' : 'bg-yellow-600'}`} style={{ width: `${details.overallSavingsMs / 30}px` }} />}
          </div>
          <div className='col-span-1 flex items-center justify-end'>
            <h3 className="text-sm font-extralight w-fit">
              {['millisecond', 'seconds'].includes(numericUnit) && numericValue > 0 ? formattedMsOrSeconds(numericValue) : displayValue}
              {isCollapsed ? <ArrowsPointingOutIcon className='h-4 w-4 inline-block text-gray-400 ml-2' /> : <ArrowsPointingInIcon className='h-5 w-5 inline-block text-gray-400 ml-2' />}
            </h3>
          </div>
        </div>
      </div>
      <div className={isCollapsed ? 'hidden' : 'p-4'}>
        <MarkdownText text={description} />
        <div className='mt-4'>
          <div className={`grid grid-cols-${details?.headings?.length + 1}`}>
            {(details?.headings || []).map(({ label }, i) => (
              <div key={i} className={`${i === 0 ? 'col-span-2' : 'col-span-1'} py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3`}>{label}</div>
            ))}
          </div>
          {(details?.items || []).map((itemDetails, i) => (
            <div className={`grid grid-cols-${details?.headings?.length + 1} ${i % 2 === 0 ? 'bg-gray-100' : undefined}`} key={i}>
              {(details?.headings || []).map(({ key, valueType }, j) => (
                <div key={j} className={`truncate py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3 ${j === 0 ? 'col-span-2' : 'col-span-1'}`}>
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