import WaterfallRowName from './WaterfallRowName';
import WaterfallRowVisual from './WaterfallRowVisual';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { bytesToHumanFileSize } from '@/lib/utils';

const deDupAndFormatResources = resources => {
  const filteredResourcesMap = {};
  resources.forEach(resource => {
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
    } else {
      filteredResourcesMap[strippedQueryParamResource] = resource;
    }
  });
  return Object.values(filteredResourcesMap);
}

export default function Waterfall({ resources, performanceMetricsAverages }) {
  // const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });

  const formattedResources = deDupAndFormatResources(resources);
  const sortedResources = formattedResources.sort((a, b) => parseFloat(a.average_start_time) - parseFloat(b.average_start_time));
  const lastResource = sortedResources[sortedResources.length - 1];
  const roughlyLastTimestamp = parseFloat(lastResource.average_start_time) + parseFloat(lastResource.average_duration);
  const tickIndicatorMs = 500;
  const performanceMetricColorDict = { LCP: 'red-700', FCP: 'green-700', TTFB: 'blue-700' };
  
  let timeMarkers = [null];
  while (timeMarkers.length * tickIndicatorMs < roughlyLastTimestamp) {
    const formattedTime = timeMarkers.length * tickIndicatorMs >= 1_000 ? `${(timeMarkers.length * tickIndicatorMs) / 1_000} s` : `${timeMarkers.length * tickIndicatorMs} ms`;
    timeMarkers.push(
      <div className='text-end inline-block text-gray-400 text-sm' style={{ width: `${(tickIndicatorMs / roughlyLastTimestamp) * 100}%` }}>
        {formattedTime}
      </div>
    )
  }

  const performanceTicks = performanceMetricsAverages.filter(metric => ['LCP', 'FCP', 'TTFB'].includes(metric.name)).map(metric => {
    return (
      <div className={`absolute top-0 left-0 border-r-4 z-10 h-full border-${performanceMetricColorDict[metric.name]}`} 
            style={{ width: `${(parseFloat(metric.average) / roughlyLastTimestamp) * 100}%` }} />
    )
  })

  return (
    <div className='w-full p-2 m-2'>
      <div className='flex'>
        <div className='w-[25%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
          <div className='block'>Resource</div>
        </div>
        <div className='w-[10%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
          <div className='block'>Size</div>
        </div>
        <div className='w-[65%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
          {timeMarkers}
        </div>
      </div>
      <div className='relative'>
        {sortedResources.map((resource, i) => {
          return (
            <>
              <div className={`w-full flex border-t border-white-100 ${resource.render_blocking_status === 'blocking' ? 'bg-red-100' : i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <div className='w-[25%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
                  <WaterfallRowName resource={resource} index={i} />
                </div>
                <div className='w-[10%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
                  <div className='flex items-center justify-center p-2'>
                    {bytesToHumanFileSize(resource.average_transfer_size)}
                  </div>
                </div>
                <div className='w-[65%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
                  <div className='flex items-center h-full'>
                    <WaterfallRowVisual resource={resource} performanceTicks={performanceTicks} roughlyLastTimestamp={roughlyLastTimestamp} />
                  </div>
                </div>
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}