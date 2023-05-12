import { usePopperTooltip } from "react-popper-tooltip";
import { DocumentTextIcon, CodeBracketIcon, PaintBrushIcon, ArrowsRightLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";

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
    <span className='mr-1 rounded inline-flex border border-gray-600 h-4 w-4' style={{ padding: '1px' }} >
      <BookOpenIcon className={`text-gray-600 inline-block`} aria-hidden="true" />
    </span >
  )
}

export default function  RequestTitle({ requestDetails }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  return (
    <div className='relative overflow-x-hidden whitespace-nowrap flex items-center hover:bg-white hover:absolute hover:z-50 hover:w-fit hover:rounded hover:pr-2 hover:top-2'>
      {requestDetails.requestType() === 'Image'
        ? (
          <>
            <img className='inline-block h-4 w-4 mr-1' src={requestDetails.url()} ref={setTriggerRef} />
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                <img className='inline-block h-32 w-32' src={requestDetails.url()} />
                <div {...getArrowProps({ className: 'tooltip-arrow' })} />
              </div>
            )}
          </>
        ) : (
          <>
            <span ref={setTriggerRef}>
              {RESOURCE_TYPE_ICON_DICT[requestDetails.requestType()]}
            </span>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                <div className='bg-white text-xs text-gray-700 p-2'>
                  {requestDetails.requestType()} request
                </div>
              </div>
            )}
          </>
        )}
      <span className={`text-sm ${requestDetails.isRenderBlocking() ? 'text-red-600' : 'text-gray-700'}`}>
        {requestDetails.friendlyURL()}
      </span>
    </div>
  )
}