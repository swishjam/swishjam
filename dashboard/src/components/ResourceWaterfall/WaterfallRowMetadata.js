import LCPIndicator from "./LCPIndicator";
import RenderBlockingIndicator from "./RenderBlockingIndicator";

const sanitizedResourceUrl = url => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`
  } catch (err) {
    return url;
  }
};

export default function WaterfallRowMetadata({ resource, largestContentfulPaintEntriesAverages }) {
  const largestPaintEntryForResource = largestContentfulPaintEntriesAverages.find(entry => sanitizedResourceUrl(entry.url) === sanitizedResourceUrl(resource.name));
  const sortedLargestPaintEntries = largestContentfulPaintEntriesAverages.sort((a, b) => parseInt(b.count) - parseInt(a.count));
  const isMostCommonLcp = largestPaintEntryForResource && 
                            sanitizedResourceUrl(sortedLargestPaintEntries[0].url) === sanitizedResourceUrl(largestPaintEntryForResource.url);

  return (
    <div className='cursor-default'>
      {parseInt(resource.render_blocking_count || 0) > 0 && <RenderBlockingIndicator />}
      {largestPaintEntryForResource && <LCPIndicator isMostCommonLcp={isMostCommonLcp} />}
    </div>
  )
}