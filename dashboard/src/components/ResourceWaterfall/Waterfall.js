import WaterfallRowName from './WaterfallRowName';
import WaterfallRowSize from './WaterfallRowSize';
import WaterfallRowVisual from './WaterfallRowVisual';
import WaterfallOverlay from './WaterfallOverlay';
import WaterfallRowMetadata from './WaterfallRowMetadata';

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
    } catch(err) {
      filteredLCPEntriesMap[lcpEntry.url] = lcpEntry;
    }
  })
  return Object.values(filteredLCPEntriesMap);
}

const deDupAndFormatResources = resources => {
  const filteredResourcesMap = {};
  let maxTs = 0;
  resources.forEach(resource => {
    if (resource.average_start_time <= MAX_PERF_ENTRY_START_TIME) {
      const parsedResourceUrl = new URL(resource.name);
      const strippedQueryParamResource = `${parsedResourceUrl.origin}${parsedResourceUrl.pathname}`;
      const existingResource = filteredResourcesMap[strippedQueryParamResource];
      if (existingResource && existingResource.initiator_type === resource.initiator_type) {
        existingResource.render_blocking_count = parseFloat(existingResource.render_blocking_count || 0) + parseFloat(resource.render_blocking_count || 0);
        existingResource.non_render_blocking_count = parseFloat(existingResource.non_render_blocking_count || 0) + parseFloat(resource.non_render_blocking_count || 0);
        existingResource.average_start_time = (parseFloat(existingResource.average_start_time) + parseFloat(resource.average_start_time)) / 2;
        existingResource.average_duration = (parseFloat(existingResource.average_duration) + parseFloat(resource.average_duration)) / 2;
        existingResource.average_transfer_size = (parseFloat(existingResource.average_transfer_size) + parseFloat(resource.average_transfer_size)) / 2;
        existingResource.average_domain_lookup_start = (parseFloat(existingResource.average_domain_lookup_start) + parseFloat(resource.average_domain_lookup_start)) / 2;
        existingResource.average_domain_lookup_end = (parseFloat(existingResource.average_domain_lookup_end) + parseFloat(resource.average_domain_lookup_end)) / 2;
        existingResource.average_connect_start = (parseFloat(existingResource.average_connect_start) + parseFloat(resource.average_connect_start)) / 2;
        existingResource.average_connect_end = (parseFloat(existingResource.average_connect_end) + parseFloat(resource.average_connect_end)) / 2;
        existingResource.average_secure_connection_start = (parseFloat(existingResource.average_secure_connection_start) + parseFloat(resource.average_secure_connection_start)) / 2;
        existingResource.average_request_start = (parseFloat(existingResource.average_request_start) + parseFloat(resource.average_request_start)) / 2;
        existingResource.average_response_start = (parseFloat(existingResource.average_response_start) + parseFloat(resource.average_response_start)) / 2;
        existingResource.average_response_end = (parseFloat(existingResource.average_response_end) + parseFloat(resource.average_response_end)) / 2;
        existingResource.count = parseInt(existingResource.count) + parseInt(resource.count);
        if (existingResource.average_response_end > maxTs) maxTs = existingResource.average_response_end;
      } else {
        filteredResourcesMap[strippedQueryParamResource] = resource;
        if (resource.average_response_end > maxTs) maxTs = resource.average_response_end;
      }
    }
  });
  return { maxTimestamp: maxTs, resources: Object.values(filteredResourcesMap) };
}

const MAX_PERF_ENTRY_START_TIME = 20_000;

export default function Waterfall({ resources, performanceMetricsAverages, navigationPerformanceEntriesAverages, largestContentfulPaintEntriesAverages }) {
  const { resources: formattedResources, maxTimestamp: largestResourceEndTime } = deDupAndFormatResources(resources);
  const deDupedLCPEntries = deDupLCPEntries(largestContentfulPaintEntriesAverages);
  const maxTimestamp = Math.min(
    10_000,
    Math.max(
     ...(performanceMetricsAverages || []).map(metric => parseFloat(metric.average)),
     (navigationPerformanceEntriesAverages || {}).average_dom_complete,
     (navigationPerformanceEntriesAverages || {}).average_dom_interactive,
     (navigationPerformanceEntriesAverages || {}).average_dom_content_loaded_event_end,
     (navigationPerformanceEntriesAverages || {}).average_load_event_end,
     largestResourceEndTime || 0
   ) + 100
  );

  const sortedResources = formattedResources.sort((a, b) => parseFloat(a.average_start_time) - parseFloat(b.average_start_time));
  if (navigationPerformanceEntriesAverages && navigationPerformanceEntriesAverages.average_response_end) {
    sortedResources.unshift({
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
  
  const tickIndicatorEverMs = maxTimestamp > 5_000 ? 1_000 : 500;

  let timeMarkers = [<div className='inline-block text-gray-400 border-r h-full' style={{ width: '0%' }} />];
  while (timeMarkers.length * tickIndicatorEverMs < maxTimestamp) {
    const formattedTime = timeMarkers.length * tickIndicatorEverMs >= 1_000 ? 
                            `${(timeMarkers.length * tickIndicatorEverMs) / 1_000} s` : 
                            `${timeMarkers.length * tickIndicatorEverMs} ms`;
    timeMarkers.push(
      <div className='text-end inline-block text-gray-400 text-sm border-r h-full' style={{ width: `${(tickIndicatorEverMs / maxTimestamp) * 100}%` }}>
        {formattedTime}
      </div>
    )
  }

  return (
    <div className='w-full p-2 m-2'>
      <div className='flex'>
        <div className='w-[25%] border-gray-200 truncate text-sm text-gray-700 inline-block rounded-lg'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Resource</div>
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowName resource={resource} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[7.5%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Size</div>
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowSize resource={resource} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[7.5%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5'></div>
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowMetadata resource={resource} largestContentfulPaintEntriesAverages={deDupedLCPEntries} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[60%] border-gray-300 text-sm text-gray-700 inline-block relative overflow-x-scroll'>
          <div className='min-w-[100%] block h-5'>
            {timeMarkers}
          </div>
          <WaterfallOverlay performanceMetrics={performanceMetricsAverages} navigationPerformanceEntriesAverages={navigationPerformanceEntriesAverages} maxTimestamp={maxTimestamp} />
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center min-w-[100%] h-10 py-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowVisual resource={resource} index={i} maxTimestamp={maxTimestamp} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}