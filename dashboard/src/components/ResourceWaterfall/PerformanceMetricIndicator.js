import { formattedMsOrSeconds } from '@/lib/utils';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

export default function PerformanceMetricIndicator({ metric }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: true, trigger: 'hover' });
  const borderColor = { 
    'LCP': 'red', 
    'FCP': 'green', 
    'TTFB': 'blue',
    'DOM Complete': 'purple',
    'DOM Content Loaded': 'orange',
    'DOM Interactive': 'pink',
    'Load': 'brown'
  }[metric.name];

  const PIXELS_PER_MS = 0.15;

  return (
    <>
      <div className={`absolute top-0 z-10`}
            key={metric.name}
            ref={setTriggerRef}
            style={{ 
              marginLeft: `${(parseFloat(metric.value) * PIXELS_PER_MS) - 3}px`, 
              borderWidth: '1.5px', 
              borderStyle: 'dashed', 
              height: `calc(100% - 1.4rem)`,
              marginTop: '1.4rem',
              borderColor: borderColor,
            }} />
        {visible && (
          <div className='absolute top-0 left-0 z-20' ref={setTooltipRef} {...getTooltipProps()}>
            <div className='bg-white rounded shadow-lg p-2'>
              <div className='text-sm font-bold'>{metric.name}</div>
              <div className='text-sm'>{formattedMsOrSeconds(metric.value)}</div>
            </div>
            <div className='bg-white rounded shadow-lg p-2' {...getArrowProps({ className: 'tooltip-arrow' })} />
          </div>
        )}
    </>
  )
}