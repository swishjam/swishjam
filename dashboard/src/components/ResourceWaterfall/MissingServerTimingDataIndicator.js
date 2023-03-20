import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import { usePopperTooltip } from "react-popper-tooltip";

export default function MissingServerTimingDataIndicator() {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });

  return (
    <>
      <span ref={setTriggerRef} className="inline-flex items-center rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
        <QuestionMarkCircleIcon className='w-4 h-4 mr-1' />
        Partial data
      </span>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[50%] z-20' })}>
          <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className="text-sm text-gray-900">
            This is a third party resource that does not provide the Server Timing response headers that enables Swishjam to collect the full set of performance data.
          </div>
        </div>
      )}
    </>
  )
}