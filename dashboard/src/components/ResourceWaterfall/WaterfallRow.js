import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { PaintBrushIcon, CodeBracketIcon, CameraIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { bytesToHumanFileSize } from "@/lib/utils";

const RESOURCE_TYPE_COLOR_DICT = {
  'script': 'bg-blue-300',
  'link': 'bg-green-300',
  'img': 'bg-yellow-300',
  'fetch': 'bg-purple-300',
  'xmlhttprequest': 'bg-purple-300',
  'other': 'bg-gray-300',
};

const RESOURCE_TYPE_ICON_DICT = {
  'script': <CodeBracketIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'link': <PaintBrushIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'img': <CameraIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'fetch': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'xmlhttprequest': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
}

export default function WaterfallRow({ resource, roughlyLastTimestamp, index }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: true, trigger: 'hover' });

  return (
    <div className={`w-full p-2 flex ${resource.render_blocking_status === 'blocking' ? 'bg-red-100' : index % 2 === 0 ? 'bg-gray-100' : ''}`} ref={setTriggerRef}>
      <div className='w-[25%] border-gray-300 truncate text-sm text-gray-700 inline-flex items-center'>
        <div className='flex items-center'>
          <span className='mr-1'>{index + 1} </span>
          <span className='inline-block mr-1'>{RESOURCE_TYPE_ICON_DICT[resource.initiator_type] || resource.initiator_type}</span>
          <span>{resource.name}</span>
        </div>
      </div>
      <div className='w-[10%] inline-flex items-center w-full p-1 truncate text-sm text-gray-700 justify-center'>
        {bytesToHumanFileSize(resource.average_transfer_size)}
      </div>
      <div className='w-[65%] inline-flex items-center w-full p-1'>
        <div className={`${RESOURCE_TYPE_COLOR_DICT[resource.initiator_type]} rounded h-full`} style={{
          marginLeft: `${(resource.average_start_time / roughlyLastTimestamp) * 100}%`,
          width: `${(resource.average_duration / roughlyLastTimestamp) * 100}%`
        }}></div>
      </div>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[50%]' })}>
          <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='text-sm text-gray-700'>
            <div className='flex items-center p-4'>
              <div>
                <span className='block'>
                  {RESOURCE_TYPE_ICON_DICT[resource.initiator_type]} {resource.initiator_type}
                </span>
                <span className='block'>{resource.name}</span>
                <span className='block'>Average start_time {parseFloat(resource.average_start_time).toFixed(2)} ms</span>
                <span className='block'>Average domain_lookup_start {resource.average_domain_lookup_start}</span>
                <span className='block'>Average domain_lookup_end {resource.average_domain_lookup_end}</span>
                <span className='block'>Average connect_start {resource.average_connect_start}</span>
                <span className='block'>Average connect_end {resource.average_connect_end}</span>
                <span className='block'>Average secure_connection_start {resource.average_secure_connection_start}</span>
                <span className='block'>Average request_start {resource.average_request_start}</span>
                <span className='block'>Average response_start {resource.average_response_start}</span>
                <span className='block'>Average response_end {resource.average_response_end}</span>
                <span className='block'>Average duration {resource.average_duration}</span>
                <span className='block'>Average transfer_size {bytesToHumanFileSize(resource.average_transfer_size)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}