import RequestVisual from "./RequestVisual";
import { usePopperTooltip } from "react-popper-tooltip";
import { DocumentTextIcon, CodeBracketIcon, PaintBrushIcon, ArrowsRightLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { bytesToHumanFileSize } from "@/lib/utils";

const RESOURCE_TYPE_ICON_DICT = {
  Document: <DocumentTextIcon className={`text-blue-600 h-5 w-4 mr-1 inline-flex`} aria-hidden="true" />,
  Script: (
    <span className='mr-1 rounded inline-flex border border-blue-300 h-4 w-4' style={{ padding: '1px' }}>
      <CodeBracketIcon className={`text-blue-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  Stylesheet: (
    <span className='mr-1 rounded inline-flex border border-green-300 h-4 w-4' style={{ padding: '1px' }}>
      <PaintBrushIcon className={`text-green-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  XHR: (
    <span className='mr-1 rounded inline-flex border border-purple-300 h-4 w-4' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-purple-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  Ping: (
    <span className='mr-1 rounded inline-flex border border-purple-300 h-4 w-4' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-purple-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  Fetch: (
    <span className='mr-1 rounded inline-flex border border-purple-300 h-4 w-4' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-purple-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  Font: (
    <span className='mr-1 rounded inline-flex border border-gray-600 h-4 w-4' style = {{ padding: '1px' }} >
      <BookOpenIcon className={`text-gray-600 inline-block`} aria-hidden="true" />
    </span >
  )
}

export default function RequestRow({ requestDetails, pixelToMsRatio, mostLikelyLastTimestamp, isLCP, bgKlass }) {
  const decipheredBgKlass = isLCP 
                    ? 'bg-yellow-100' 
                    : requestDetails.isRenderBlocking()
                      ? 'bg-red-100' 
                      : bgKlass;
  return (
    <>
      <div className={`col-span-1 cursor-default p-2 inline-block border-r border-gray-200 overflow-x-hidden whitespace-nowrap h-full flex items-center ${decipheredBgKlass}`}>
        <RequestTitle requestDetails={requestDetails} />
      </div>
      <div className={`col-span-1 cursor-default p-2 inline-block border-r border-gray-200 text-sm text-gray-700 overflow-x-hidden whitespace-nowrap h-full flex items-center ${decipheredBgKlass}`}>
        {bytesToHumanFileSize(requestDetails.size())}
      </div>
      <div className={`col-span-6 relative inline-block h-full whitespace-nowrap ${decipheredBgKlass}`}>
        {Array.from({ length: Math.ceil(mostLikelyLastTimestamp / 1000) }).map((_, i) => (
          <div 
            className='inline-block border-r border-gray-300 top-0 z-10 h-full' 
            style={{ width: `${pixelToMsRatio * 1_000}px` }} 
            key={i}
          />
        ))}
        <RequestVisual requestDetails={requestDetails} pixelToMsRatio={pixelToMsRatio} isLCP={isLCP} />
      </div>
    </>
  )
}

// const RequestMetadata = ({ requestDetails }) => {
//   return (
//     requestDetails.renderBlocking !== 'non_blocking' && (
//       <span className='text-red-600 text-sm block'>
//         <XCircleIcon className='h-4 w-4 text-red-600 mr-1 inline-block font-medium' />
//       </span>
//     )
//   )
// }