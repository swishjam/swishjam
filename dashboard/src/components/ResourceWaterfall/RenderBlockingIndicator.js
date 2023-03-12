import { usePopperTooltip } from 'react-popper-tooltip';

export default function RenderBlockingIndicator() {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ trigger: 'hover' });
  
  return (
    <>
      <span ref={setTriggerRef} className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        BLOCKING
      </span>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[50%] z-20' })}>
          <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className="text-sm text-gray-900">
            This resource blocks rendering while it is being fetched and parsed.
          </div>
        </div>
      )}
    </>
  )
}