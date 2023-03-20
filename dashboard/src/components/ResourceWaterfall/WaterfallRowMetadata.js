import LCPIndicator from "./LCPIndicator";
import RenderBlockingIndicator from "./RenderBlockingIndicator";
import MissingServerTimingDataIndicator from "./MissingServerTimingDataIndicator";

const sanitizedResourceUrl = url => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`
  } catch (err) {
    return url;
  }
};

export default function WaterfallRowMetadata({ resource, largestContentfulPaintEntries }) {
  // const totalLCPCount = largestContentfulPaintEntries.reduce((entry, total) => parseInt(entry.count) + total.count);
  const largestPaintEntryForResource = largestContentfulPaintEntries.find(entry => sanitizedResourceUrl(entry.url) === sanitizedResourceUrl(resource.name));
  const sortedLargestPaintEntries = largestContentfulPaintEntries.sort((a, b) => parseInt(b.count) - parseInt(a.count));
  const isMostCommonLcp = largestPaintEntryForResource && 
                            sanitizedResourceUrl(sortedLargestPaintEntries[0].url) === sanitizedResourceUrl(largestPaintEntryForResource.url);
  // const isLCPPercentOfTime = parseInt(largestPaintEntryForResource?.count || 0) / totalLCPCount;

  return (
    <div className='cursor-default flex items-center overflow-x-scroll'>
      {resource.render_blocking_status === 'blocking' && <div className='mr-1'><RenderBlockingIndicator /></div>}
      {largestPaintEntryForResource && <div className='mr-1'><LCPIndicator isMostCommonLcp={isMostCommonLcp} /></div>}
      {resource.encoded_body_size === 0 && <MissingServerTimingDataIndicator />}
    </div>
  )
}