import { bytesToHumanFileSize, formattedMsOrSeconds, calculatedResourceTimings } from '@/lib/utils';
import { useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const REQUEST_LIFE_CYCLE_COLOR_DICT = {
  waiting: ['bg-gray-300', 'bg-gray-400'],
  dns: ['bg-teal-700', 'bg-teal-800'],
  tcp: ['bg-orange-500', 'bg-orange-600'],
  tls: ['bg-purple-500', 'bg-purple-600'],
  request: ['bg-blue-500', 'bg-blue-600'],
  response: ['bg-red-400', 'bg-red-500'],
}

export default function WaterfallRowVisual({ resource, maxTimestamp }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  const [isBeingHovered, setIsBeingHovered] = useState(false);
  
  const TIMESTAMP_EVERY_MS = 500;
  const PIXELS_PER_MS = 0.15;
  const timings = calculatedResourceTimings(resource);

  let ticks = [<div className='absolute top-0 left-0 h-full w-full border-r border-gray-300 z-0' style={{ width: '0px' }} />];
  while (ticks.length * TIMESTAMP_EVERY_MS < maxTimestamp) {
    ticks.push(<div className='absolute top-0 left-0 h-full w-full border-r border-gray-300 z-0' key={ticks.length} style={{
      width: '0px',
      marginLeft: `${(TIMESTAMP_EVERY_MS * ticks.length * PIXELS_PER_MS)}px`
    }} />);
  }

  return(
    <div className='h-full w-full'>
      <div className={`flex items-center z-10 rounded h-full`} 
            ref={setTriggerRef} 
            onMouseOver={() => setIsBeingHovered(true)} 
            onMouseOut={() => setIsBeingHovered(false)}
            style={{
              marginLeft: `${(resource.start_time * PIXELS_PER_MS)}px`,
              width: `${(resource.request_duration 
                            ? resource.waiting_duration + resource.dns_lookup_duration + resource.tcp_duration + resource.ssl_duration + resource.request_duration + resource.response_duration
                            : resource.duration) 
                            * PIXELS_PER_MS}px`
            }}>
        {resource.request_duration ? (
          <>
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.waiting[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.waiting[0]}`} 
                  style={{ width: `${resource.waiting_duration * PIXELS_PER_MS}px` }} />
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.dns[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.dns[0]}`} 
                  style={{ width: `${resource.dns_lookup_duration * PIXELS_PER_MS}px` }} />
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.tcp[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.tcp[0]}`} 
                  style={{ width: `${(resource.tcp_duration + timings.tls) * PIXELS_PER_MS}px` }} />
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.tls[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.tls[0]}`} 
                  style={{ width: `${resource.ssl_duration * PIXELS_PER_MS}px` }} />
            <div className={`h-[100%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.request[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`} 
                  style={{ width: `${resource.request_duration * PIXELS_PER_MS}px` }} />
            <div className={`h-[100%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.response[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.response[0]}`} 
                  style={{ width: `${resource.response_duration * PIXELS_PER_MS}px` }} />
          </>
        ) : (
          <>
            <div className={`h-[100%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.request[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`} 
                  style={{ width: `${resource.duration * PIXELS_PER_MS}px` }} />
          </>
        )}
      </div>
      {ticks}
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[70%] z-20' })}>
          <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='text-sm text-gray-700'>
            <div className='flex items-center p-4'>
              <div>
                <table class='table-auto'>
                  <tbody>
                    <tr>
                      <td className='p-2 text-gray-500'>Name</td>
                      <td>{resource.name}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Total occurrences</td>
                      <td>{resource.total_count}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Resource type</td>
                      <td>{resource.initiator_type}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Start time</td>
                      <td>{formattedMsOrSeconds(resource.start_time)}</td>
                    </tr>
                    {resource.response_duration ? (
                      <>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.waiting[0]}`}></div>
                            <span class='italic'>Waiting</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.waiting_duration)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.dns[0]}`}></div>
                            <span class='italic'>DNS Lookup</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.dns_lookup_duration)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.tcp[0]}`}></div>
                            <span class='italic'>TCP</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.tcp_duration)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.tls[0]}`}></div>
                            <span class='italic'>SSL</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.ssl_duration)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`}></div>
                            <span class='italic'>Request</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.request_duration)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.response[0]}`}></div>
                            <span class='italic'>Download</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.response_duration)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 font-semibold flex items-center'>
                            <span class='italic'>Total Duration</span>
                          </td>
                          <td>{formattedMsOrSeconds(resource.waiting_duration + resource.dns_lookup_duration + resource.tcp_duration + resource.ssl_duration + resource.request_duration + resource.response_duration)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td className='p-2 text-gray-500 flex items-center'>
                          <div className={`h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`}></div>
                          <span class='italic'>Network time</span>
                        </td>
                        <td>{formattedMsOrSeconds(resource.duration)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}