import WaterfallRowName from './WaterfallRowName';
import WaterfallRowSize from './WaterfallRowSize';
import WaterfallRowVisual from './WaterfallRowVisual';
import WaterfallOverlay from './WaterfallOverlay';
import WaterfallRowMetadata from './WaterfallRowMetadata';
import { formattedMsOrSeconds } from '@/lib/utils';

const deDupLCPEntries = lcpEntries => {
  const filteredLCPEntriesMap = {};
  lcpEntries.forEach(lcpEntry => {
    try {
      const parsedLCPEntryUrl = new URL(lcpEntry.url);
      const strippedQueryParamLCPEntry = `${parsedLCPEntryUrl.origin}${parsedLCPEntryUrl.pathname}`;
      const existingLCPEntry = filteredLCPEntriesMap[strippedQueryParamLCPEntry];
      if (existingLCPEntry) {
        existingLCPEntry.average_start_time = (parseFloat(existingLCPEntry.average_start_time) + parseFloat(lcpEntry.average_start_time)) / 2;
        existingLCPEntry.average_render_time = (parseFloat(existingLCPEntry.average_render_time) + parseFloat(lcpEntry.average_render_time)) / 2;
        existingLCPEntry.average_load_time = (parseFloat(existingLCPEntry.average_load_time) + parseFloat(lcpEntry.average_load_time)) / 2;
        existingLCPEntry.average_size = (parseFloat(existingLCPEntry.average_size) + parseFloat(lcpEntry.average_size)) / 2;
        existingLCPEntry.count = parseInt(existingLCPEntry.count) + parseInt(lcpEntry.count);
      } else {
        filteredLCPEntriesMap[strippedQueryParamLCPEntry] = lcpEntry;
      }
    } catch (err) {
      // we only care about the LCP entries with URLs
      // filteredLCPEntriesMap[lcpEntry.url] = lcpEntry;
    }
  })
  return Object.values(filteredLCPEntriesMap);
}

export default function Waterfall({ resources, performanceMetricsAverages, navigationPerformanceEntriesAverages, largestContentfulPaintEntriesAverages }) {
  const deDupedLCPEntries = deDupLCPEntries(largestContentfulPaintEntriesAverages);
  const largestResourceEndTime = Math.max(...resources.map(resource => parseFloat(resource.average_response_end)));

  const MAX_ALLOWED_TIMESTAMP = 20_000;
  const maxTimestamp = Math.min(
    MAX_ALLOWED_TIMESTAMP,
    Math.max(
      ...(performanceMetricsAverages || []).map(metric => parseFloat(metric.average)),
      (navigationPerformanceEntriesAverages || {}).average_dom_complete,
      (navigationPerformanceEntriesAverages || {}).average_dom_interactive,
      (navigationPerformanceEntriesAverages || {}).average_dom_content_loaded_event_end,
      (navigationPerformanceEntriesAverages || {}).average_load_event_end,
      largestResourceEndTime || 0
    ) + 100
  );

  if (
    resources[0] &&
      resources[0].initiator_type !== 'navigation' && 
      navigationPerformanceEntriesAverages && 
      navigationPerformanceEntriesAverages.average_response_end
    ) {
    resources.unshift({
      name: navigationPerformanceEntriesAverages.name,
      initiator_type: 'navigation',
      average_duration: parseFloat(navigationPerformanceEntriesAverages.average_duration || 0),
      average_fetch_start: parseFloat(navigationPerformanceEntriesAverages.average_fetch_start || 0),
      average_start_time: parseFloat(navigationPerformanceEntriesAverages.average_start_time || 0),
      average_domain_lookup_start: parseFloat(navigationPerformanceEntriesAverages.average_domain_lookup_start || 0),
      average_domain_lookup_end: parseFloat(navigationPerformanceEntriesAverages.average_domain_lookup_end || 0),
      average_connect_start: parseFloat(navigationPerformanceEntriesAverages.average_connect_start || 0),
      average_connect_end: parseFloat(navigationPerformanceEntriesAverages.average_connect_end || 0),
      average_secure_connection_start: parseFloat(navigationPerformanceEntriesAverages.average_secure_connection_start || 0),
      average_request_start: parseFloat(navigationPerformanceEntriesAverages.average_request_start || 0),
      average_response_start: parseFloat(navigationPerformanceEntriesAverages.average_response_start || 0),
      average_response_end: parseFloat(navigationPerformanceEntriesAverages.average_response_end || 0),
      average_transfer_size: parseFloat(navigationPerformanceEntriesAverages.average_transfer_size || 0),
    });
  }
  
  const TIMESTAMP_EVERY_MS = 500;
  const PIXELS_PER_MS = 0.15;

  let timeMarkers = [<div className='inline-block text-gray-400 border-r h-full' style={{ width: '0px' }} />];
  while (timeMarkers.length * TIMESTAMP_EVERY_MS < maxTimestamp) {
    const formattedTime = formattedMsOrSeconds(timeMarkers.length * TIMESTAMP_EVERY_MS);
    timeMarkers.push(
      <div className='text-end inline-block text-gray-400 text-sm border-r h-full' style={{ width: `${TIMESTAMP_EVERY_MS * PIXELS_PER_MS}px` }}>
        {formattedTime}
      </div>
    )
  }

  return (
    <div className='w-full p-2 m-2'>
      <div className='flex'>
        <div className='w-[20%] border-gray-200 truncate text-sm text-gray-700 inline-block rounded-lg'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Resource</div>
          {resources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowName resource={resource} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[7.5%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Size</div>
          {resources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowSize resource={resource} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[7.5%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Time</div>
          {resources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                {formattedMsOrSeconds(resource.average_response_end - resource.average_start_time)}
              </div>
            )
          })}
        </div>
        <div className='w-[8%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5'></div>
          {resources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowMetadata resource={resource} largestContentfulPaintEntriesAverages={deDupedLCPEntries} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[57%] border-gray-300 text-sm text-gray-700 inline-block relative overflow-x-scroll'>
          <div className='block h-5' style={{ width: `${timeMarkers.length * TIMESTAMP_EVERY_MS * PIXELS_PER_MS}px` }}>
            {timeMarkers}
          </div>
          <WaterfallOverlay performanceMetrics={performanceMetricsAverages} navigationPerformanceEntriesAverages={navigationPerformanceEntriesAverages} maxTimestamp={maxTimestamp} />
          {resources.map((resource, i) => {
            return (
              <div className={`flex items-center min-w-[100%] h-10 py-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} 
                    key={i} 
                    style={{ width: `${timeMarkers.length * TIMESTAMP_EVERY_MS * PIXELS_PER_MS}px` }}>
                <WaterfallRowVisual resource={resource} index={i}  maxTimestamp={maxTimestamp} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}