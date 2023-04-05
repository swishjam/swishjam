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
      filteredLCPEntriesMap[lcpEntry.url] = lcpEntry;
    }
  })
  return Object.values(filteredLCPEntriesMap);
}

export default function Waterfall({ resources, performanceMetricsValues, navigationPerformanceEntries, largestContentfulPaintEntries }) {
  const deDupedLCPEntries = deDupLCPEntries(largestContentfulPaintEntries);
  const largestResourceEndTime = Math.max(...resources.map(resource => parseFloat(resource.response_end)));

  const MAX_ALLOWED_TIMESTAMP = 40_000;
  const maxTimestamp = Math.min(
    MAX_ALLOWED_TIMESTAMP,
    Math.max(
      ...(performanceMetricsValues || []).map(metric => parseFloat(metric.value)),
      (navigationPerformanceEntries || {}).dom_complete,
      (navigationPerformanceEntries || {}).dom_interactive,
      (navigationPerformanceEntries || {}).dom_content_loaded_event_end,
      (navigationPerformanceEntries || {}).load_event_end,
      largestResourceEndTime || 0
    ) + 100
  );

  if (resources[0] && resources[0].initiator_type !== 'navigation') {
    resources.unshift({ ...navigationPerformanceEntries, name: navigationPerformanceEntries.name, initiator_type: 'navigation' });
  }
  
  const TIMESTAMP_EVERY_MS = 500;
  const PIXELS_PER_MS = 0.15;

  let timeMarkers = [<div className='inline-block text-gray-400 border-r h-full' style={{ width: '0px' }} />];
  while (timeMarkers.length * TIMESTAMP_EVERY_MS < maxTimestamp) {
    const formattedTime = formattedMsOrSeconds(timeMarkers.length * TIMESTAMP_EVERY_MS);
    timeMarkers.push(
      <div key={timeMarkers.length} className='text-end inline-block text-gray-400 text-sm border-r h-full' style={{ width: `${TIMESTAMP_EVERY_MS * PIXELS_PER_MS}px` }}>
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
                {formattedMsOrSeconds(resource.response_duration 
                    ? (resource.waiting_duration + resource.dns_lookup_duration + resource.tcp_duration + resource.ssl_duration + resource.request_duration + resource.response_duration) 
                    : resource.duration)}
              </div>
            )
          })}
        </div>
        <div className='w-[8%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5'></div>
          {resources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowMetadata resource={resource} largestContentfulPaintEntries={deDupedLCPEntries} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[57%] border-gray-300 text-sm text-gray-700 inline-block relative overflow-x-scroll'>
          <div className='block h-5' style={{ width: `${timeMarkers.length * TIMESTAMP_EVERY_MS * PIXELS_PER_MS}px` }}>
            {timeMarkers}
          </div>
          <WaterfallOverlay performanceMetrics={performanceMetricsValues} navigationPerformanceEntries={navigationPerformanceEntries} />
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