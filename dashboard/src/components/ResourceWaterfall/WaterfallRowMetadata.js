import { usePopperTooltip } from "react-popper-tooltip";

const sanitizedResourceUrl = url => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`
  } catch (err) {
    return url;
  }
};

export default function WaterfallRowMetadata({ resource, largestContentfulPaintEntriesAverages }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ trigger: 'hover' });

  const largestPaintEntryForResource = largestContentfulPaintEntriesAverages.find(entry => sanitizedResourceUrl(entry.url) === sanitizedResourceUrl(resource.name));
  const sortedLargestPaintEntries = largestContentfulPaintEntriesAverages.sort((a, b) => parseInt(b.count) - parseInt(a.count));
  const isMostCommonLcp = largestPaintEntryForResource && 
                            sanitizedResourceUrl(sortedLargestPaintEntries[0].url) === sanitizedResourceUrl(largestPaintEntryForResource.url);

  return (
    <div className='cursor-default'>
      {parseInt(resource.render_blocking_count || 0) > 0 && 
        <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          BLOCKING
        </span>}
      {largestPaintEntryForResource &&
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
                  <>Sometimes the Largest Contentful Paint resource on this page, but is not the most common (identified {largestPaintEntryForResource.count} times)</>
                )}
              </div>
            </div>
          )}
        </>
      }
    </div>
  )
}