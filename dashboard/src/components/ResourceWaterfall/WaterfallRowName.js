import { CodeBracketIcon, CodeBracketSquareIcon, PaintBrushIcon, CameraIcon, ArrowsRightLeftIcon } from "@heroicons/react/20/solid"
import { usePopperTooltip } from 'react-popper-tooltip';

const RESOURCE_TYPE_ICON_DICT = {
  'script': <CodeBracketIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'link': <PaintBrushIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'css': <PaintBrushIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'img': <CameraIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'fetch': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'xmlhttprequest': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'beacon': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'iframe': <CodeBracketSquareIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'other': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
}

export default function WaterfallRowName({ resource, index }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: true, trigger: 'hover' });

  return (
    <div className='flex items-center' ref={setTriggerRef}>
      <span className='mr-1'>{index + 1} </span>
      {resource.initiator_type === 'img' ? 
        (<img src={resource.name} className='h-4 w-4 mr-1' />) : 
        (<span className='inline-block mr-1'>{RESOURCE_TYPE_ICON_DICT[resource.initiator_type] || resource.initiator_type}</span>)
      }
      <span className='truncate cursor-default'>{resource.name}</span>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='tooltip-content text-center'>
            <span>{resource.name}</span>
            {resource.initiator_type === 'img' && <img src={resource.name} className='h-24 w-24 m-auto' />}
          </div>
        </div>
      )}
    </div>
  )
}