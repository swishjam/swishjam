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
              width: `${timings.entire * PIXELS_PER_MS}px`
            }}>
        {timings.request ? (
          <>
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.waiting[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.waiting[0]}`} 
                  style={{ width: `${timings.waiting * PIXELS_PER_MS}px` }} />
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.dns[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.dns[0]}`} 
                  style={{ width: `${timings.dns * PIXELS_PER_MS}px` }} />
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.tcp[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.tcp[0]}`} 
                  style={{ width: `${(timings.tcp + timings.tls) * PIXELS_PER_MS}px` }} />
            <div className={`h-[40%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.tls[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.tls[0]}`} 
                  style={{ width: `${timings.tls * PIXELS_PER_MS}px` }} />
            <div className={`h-[100%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.request[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`} 
                  style={{ width: `${timings.request * PIXELS_PER_MS}px` }} />
            <div className={`h-[100%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.response[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.response[0]}`} 
                  style={{ width: `${timings.response * PIXELS_PER_MS}px` }} />
          </>
        ) : (
          <>
            <div className={`h-[100%] animate-[all] inline-block ${isBeingHovered ? REQUEST_LIFE_CYCLE_COLOR_DICT.request[1] : REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`} 
                  style={{ width: `${timings.entire * PIXELS_PER_MS}px` }} />
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
                      <td className='p-2 text-gray-500'>Resource type</td>
                      <td>{resource.initiator_type}</td>
                    </tr>
                    {timings.request ? (
                      <>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.waiting[0]}`}></div>
                            <span class='italic'>Waiting</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.waiting)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.dns[0]}`}></div>
                            <span class='italic'>DNS Lookup</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.dns)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.tcp[0]}`}></div>
                            <span class='italic'>TCP</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.tcp)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.tls[0]}`}></div>
                            <span class='italic'>TLS</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.tls)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`}></div>
                            <span class='italic'>Request</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.request)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <div className={`rounded h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.response[0]}`}></div>
                            <span class='italic'>Download</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.response)}</td>
                        </tr>
                        <tr>
                          <td className='p-2 text-gray-500 flex items-center'>
                            <span class='bold'>Total</span>
                          </td>
                          <td>{formattedMsOrSeconds(timings.entire)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td className='p-2 text-gray-500 flex items-center'>
                          <div className={`h-4 w-4 inline-block mr-1 ${REQUEST_LIFE_CYCLE_COLOR_DICT.request[0]}`}></div>
                          <span class='italic'>Network time</span>
                        </td>
                        <td>{formattedMsOrSeconds(timings.entire)}</td>
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