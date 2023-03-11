import { bytesToHumanFileSize, resourceTypeToHumanName } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePopperTooltip } from 'react-popper-tooltip';

const LARGE_RESOURCE_SIZE_MAP = {
  'img': 500_000,
  'script': 100_000,
  'stylesheet': 100_000,
  'font': 100_000,
  'media': 100_000
}

export default function WaterfallRowSize({ resource }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  const isLarge = LARGE_RESOURCE_SIZE_MAP[resource.initiator_type] && resource.average_transfer_size > LARGE_RESOURCE_SIZE_MAP[resource.initiator_type];

  return (
    <div className='cursor-default'>
      {isLarge ? (
        <div ref={setTriggerRef}>
          <ExclamationTriangleIcon className='text-red-600 mr-1 h-4 w-4 inline' style={{ display: 'inline' }}/>
          <span className='text-red-600'>
            {bytesToHumanFileSize(resource.average_transfer_size)}
          </span>
          {visible && (
            <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
              <div {...getArrowProps({ className: 'tooltip-arrow' })} />
              <div className='tooltip-content text-center'>
                This {resourceTypeToHumanName(resource.initiator_type)} is large, exceeding our recommendation of {bytesToHumanFileSize(LARGE_RESOURCE_SIZE_MAP[resource.initiator_type])}
              </div>
            </div>
          )}
        </div>
      ) : bytesToHumanFileSize(resource.average_transfer_size)}
    </div>
  )
}