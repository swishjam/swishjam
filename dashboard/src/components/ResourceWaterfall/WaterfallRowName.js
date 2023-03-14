import { 
  ArrowsRightLeftIcon,
  VideoCameraIcon,
  CodeBracketIcon, 
  CodeBracketSquareIcon, 
  DocumentTextIcon,
  PaintBrushIcon, 
} from "@heroicons/react/20/solid"
import { resourceTypeToHumanName } from "@lib/utils";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { useRef } from "react";

const RESOURCE_TYPE_ICON_DICT = {
  'navigation': <DocumentTextIcon className={`text-blue-600 h-5 w-4 mr-1 inline-block`} aria-hidden="true" />,
  'script': (
    <span className='inline-block mr-1 rounded flex border-2 border-blue-300 h-5 w-5' style={{ padding: '1px' }}>
      <CodeBracketIcon className={`text-blue-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'link': (
    <span className='inline-block mr-1 rounded flex border-2 border-green-300 h-5 w-5' style={{ padding: '1px' }}>
      <PaintBrushIcon className={`text-green-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'css': (
    <span className='inline-block mr-1 rounded flex border-2 border-green-300 h-5 w-5' style={{ padding: '1px' }}>
      <PaintBrushIcon className={`text-green-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'fetch': (
    <span className='inline-block mr-1 rounded flex border-2 border-purple-300 h-5 w-5' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-purple-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'xmlhttprequest': (
    <span className='inline-block mr-1 rounded flex border-2 border-purple-300 h-5 w-5' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-purple-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'beacon': (
    <span className='inline-block mr-1 rounded flex border-2 border-purple-300 h-5 w-5' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-purple-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'iframe': (
    <span className='inline-block mr-1 rounded flex border-2 border-gray-300 h-5 w-5' style={{ padding: '1px' }}>
      <CodeBracketSquareIcon className={`text-gray-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'video': (
    <span className='inline-block mr-1 rounded flex border-2 border-gray-300 h-5 w-5' style={{ padding: '1px' }}>
      <VideoCameraIcon className={`text-gray-300 inline-block`} aria-hidden="true" />
    </span>
  ),
  'other': (
    <span className='inline-block mr-1 rounded flex border-2 border-gray-300 h-5 w-5' style={{ padding: '1px' }}>
      <ArrowsRightLeftIcon className={`text-gray-300 inline-block`} aria-hidden="true" />
    </span>
  ),
}

export default function WaterfallRowName({ resource, index }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  const nameContainerEl = useRef();

  const expandDisplay = _e => {
    nameContainerEl.current.classList.add('absolute', 'z-30', 'bg-white', 'rounded', 'border', 'border-gray-100', 'w-fit', 'pr-2');
  }

  const collapseDisplay = _e => {
    nameContainerEl.current.classList.remove('absolute', 'z-30', 'bg-white', 'rounded', 'border', 'border-gray-100', 'w-fit', 'pr-2');
  }

  return (
    <div className='flex items-center w-full' ref={nameContainerEl} onMouseOver={expandDisplay} onMouseOut={collapseDisplay}>
      <span className='mr-1'>{index + 1} </span>
      {resource.initiator_type === 'img' ? 
        (
          <>
            <img src={`https://${resource.name}`} ref={setTriggerRef} className='h-3 w-3 mr-1' />
            {visible && (
              <>
                <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                  <img src={`https://${resource.name}`} className='w-80' />
                  <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                </div>
              </>
            )}
          </>
        ) : 
        (
          <>
            <span ref={setTriggerRef}>
              {RESOURCE_TYPE_ICON_DICT[resource.initiator_type] || resource.initiator_type}
            </span>
            {visible && (
              <>
                <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                  {resourceTypeToHumanName(resource.initiator_type)} request.
                  <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                </div>
              </>
            )}
          </>
        )
      }
      <span className='truncate cursor-default'>{resource.name}</span>
    </div>
  )
}