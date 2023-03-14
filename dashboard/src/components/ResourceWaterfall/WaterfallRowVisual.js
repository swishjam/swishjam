import { bytesToHumanFileSize, formattedMsOrSeconds } from '@/lib/utils';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const RESOURCE_TYPE_COLOR_DICT = {
  'navigation': ['bg-blue-600', 'hover:bg-blue-700'],
  'script': ['bg-blue-300', 'hover:bg-blue-400'],
  'link': ['bg-green-300', 'hover:bg-green-400'],
  'css': ['bg-green-300', 'hover:bg-green-400'],
  'img': ['bg-yellow-300', 'hover:bg-yellow-400'],
  'fetch': ['bg-purple-300', 'hover:bg-purple-400'],
  'xmlhttprequest': ['bg-purple-300', 'hover:bg-purple-400'],
  'beacon': ['bg-purple-300', 'hover:bg-purple-400'],
  'iframe': ['bg-gray-300', 'hover:bg-gray-400'],
  'other': ['bg-gray-300', 'hover:bg-gray-400'],
  'video': ['bg-fuchsia-400', 'hover:bg-fuchsia-500'],
};

export default function WaterfallRowVisual({ resource, maxTimestamp }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });
  
  const TIMESTAMP_EVERY_MS = 500;
  const PIXELS_PER_MS = 0.15;

  let ticks = [<div className='absolute top-0 left-0 h-full w-full border-r border-gray-300 z-0' style={{ width: '0px' }} />];
  while (ticks.length * TIMESTAMP_EVERY_MS < maxTimestamp) {
    ticks.push(<div className='absolute top-0 left-0 h-full w-full border-r border-gray-300 z-0' key={ticks.length} style={{
      // width: `${(TIMESTAMP_EVERY_MS * ticks.length * PIXELS_PER_MS)}px`,
      width: '0px',
      marginLeft: `${(TIMESTAMP_EVERY_MS * ticks.length * PIXELS_PER_MS)}px`
    }} />);
  }

  const bgColor = RESOURCE_TYPE_COLOR_DICT[resource.initiator_type] && RESOURCE_TYPE_COLOR_DICT[resource.initiator_type][0];
  const bgHoverColor = RESOURCE_TYPE_COLOR_DICT[resource.initiator_type] && RESOURCE_TYPE_COLOR_DICT[resource.initiator_type][1];

  return(
    <div className='h-full w-full'>
      <div className={`${bgColor || 'bg-blue-300'} z-10 rounded h-full ${bgHoverColor}`} ref={setTriggerRef} style={{
        marginLeft: `${(resource.average_start_time * PIXELS_PER_MS)}px`,
        width: `${(resource.average_response_end - resource.average_start_time) * PIXELS_PER_MS}px`
      }}></div>
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
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>start_time</span></td>
                      <td>{formattedMsOrSeconds(resource.average_start_time)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>domain_lookup_start</span></td>
                      <td>{formattedMsOrSeconds(resource.average_domain_lookup_start)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>domain_lookup_end</span></td>
                      <td>{formattedMsOrSeconds(resource.average_domain_lookup_end)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>connect_start</span></td>
                      <td>{formattedMsOrSeconds(resource.average_connect_start)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>connect_end</span></td>
                      <td>{formattedMsOrSeconds(resource.average_connect_end)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>secure_connection_start</span></td>
                      <td>{formattedMsOrSeconds(resource.average_secure_connection_start)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>request_start</span></td>
                      <td>{formattedMsOrSeconds(resource.average_request_start)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>response_start</span></td>
                      <td>{formattedMsOrSeconds(resource.average_response_start)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>response_end</span></td>
                      <td>{formattedMsOrSeconds(resource.average_response_end)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>duration</span></td>
                      <td>{formattedMsOrSeconds(resource.average_duration)}</td>
                    </tr>
                    <tr>
                      <td className='p-2 text-gray-500'>Average <span class='italic'>transfer_size</span></td>
                      <td>{bytesToHumanFileSize(resource.average_transfer_size)}</td>
                    </tr>
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