import { usePopperTooltip } from 'react-popper-tooltip';

export default function LCPIndicator({ isMostCommonLcp }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ trigger: 'hover' });

  return (
    <>
      <span ref={setTriggerRef} className="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
        LCP
      </span>
        {visible && (
          <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[50%] z-20' })}>
            <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
            <div className="text-sm text-gray-900">
              {isMostCommonLcp ? (
                <>The most common Largest Contentful Paint resource on this page.</>
              ) : (
                <>Sometimes the Largest Contentful Paint resource on this page, but is not the most common.</>
              )}
            </div>
          </div>
        )}
    </>
  )
}