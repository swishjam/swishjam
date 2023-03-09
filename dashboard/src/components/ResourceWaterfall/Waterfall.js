import WaterfallRowName from './WaterfallRowName';
import WaterfallRowSize from './WaterfallRowSize';
import WaterfallRowVisual from './WaterfallRowVisual';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const deDupAndFormatResources = resources => {
  const filteredResourcesMap = {};
  let maxTs = 0;
  resources.forEach(resource => {
    if (resource.average_start_time <= MAX_PERF_ENTRY_START_TIME) {
      const parsedResourceUrl = new URL(resource.name);
      const strippedQueryParamResource = `${parsedResourceUrl.origin}${parsedResourceUrl.pathname}`;
      const existingResource = filteredResourcesMap[strippedQueryParamResource];
      if (existingResource && existingResource.initiator_type === resource.initiator_type) {
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
        existingResource.count += resource.count;
        if (existingResource.average_response_end > maxTs) maxTs = existingResource.average_response_end;
      } else {
        filteredResourcesMap[strippedQueryParamResource] = resource;
        if (resource.average_response_end > maxTs) maxTs = resource.average_response_end;
      }
    }
  });
  return {
    maxTimestamp: maxTs,
    resources: Object.values(filteredResourcesMap)
  };
}

const MAX_PERF_ENTRY_START_TIME = 20_000;

export default function Waterfall({ resources, performanceMetricsAverages }) {
  // const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  const { resources: formattedResources, maxTimestamp } = deDupAndFormatResources(resources);
  const sortedResources = formattedResources.sort((a, b) => parseFloat(a.average_start_time) - parseFloat(b.average_start_time));
  const tickIndicatorEverMs = maxTimestamp > 5_000 ? 1_000 : 500;

  let timeMarkers = [<div className='inline-block text-gray-400 border-r h-full' style={{ width: '0%' }} />];
  while (timeMarkers.length * tickIndicatorEverMs < maxTimestamp) {
    const formattedTime = timeMarkers.length * tickIndicatorEverMs >= 1_000 ? `${(timeMarkers.length * tickIndicatorEverMs) / 1_000} s` : `${timeMarkers.length * tickIndicatorEverMs} ms`;
    timeMarkers.push(
      <div className='text-end inline-block text-gray-400 text-sm border-r h-full' style={{ width: `${(tickIndicatorEverMs / maxTimestamp) * 100}%` }}>
        {formattedTime}
      </div>
    )
  }

  // const performanceTicks = performanceMetricsAverages.filter(metric => ['LCP', 'FCP', 'TTFB'].includes(metric.name)).map(metric => {
  //   const borderColor = { LCP: 'border-red-700', FCP: 'border-green-700', TTFB: 'border-blue-700' }[metric.name];
  //   return (
  //     <div className={`absolute top-0 left-0 border-r-4 z-10 h-full ${borderColor}`} 
  //           key={metric.name}
  //           style={{ width: `${(parseFloat(metric.average) / maxTimestamp) * 100}%` }} />
  //   )
  // })

  return (
    <div className='w-full p-2 m-2'>
      <div className='flex'>
        <div className='w-[25%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
          <div className='block h-5'>Resource</div>
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowName resource={resource} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[10%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
          <div className='block h-5'>Size</div>
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center h-10 p-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowSize resource={resource} index={i} />
              </div>
            )
          })}
        </div>
        <div className='w-[65%] border-gray-300 text-sm text-gray-700 inline-block overflow-x-scroll'>
          <div className='block h-5'>
            {timeMarkers}
          </div>
          {sortedResources.map((resource, i) => {
            return (
              <div className={`flex items-center min-w-[100%] h-10 p-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <WaterfallRowVisual resource={resource} index={i} maxTimestamp={maxTimestamp} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}