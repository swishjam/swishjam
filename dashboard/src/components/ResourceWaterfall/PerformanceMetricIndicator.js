import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

export default function PerformanceMetricIndicator({ metric, maxTimestamp }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: true, trigger: 'hover' });
  const bgColor = { 
    'LCP': 'bg-red-700', 
    'FCP': 'bg-green-700', 
    'TTFB': 'bg-blue-700',
    'DOM Complete': 'bg-purple-700',
    'DOM Content Loaded': 'bg-orange-300',
    'DOM Interactive': 'bg-pink-400',
    'Load': 'bg-yellow-700'
  }[metric.name];

  return (
    <>
      <div className={`absolute top-0 z-10 h-full ${bgColor}`}
            key={metric.name}
            ref={setTriggerRef}
            style={{ width: '3px', marginLeft: `${(parseFloat(metric.average) / maxTimestamp) * 100}%` }} />
        {visible && (
          <div className='absolute top-0 left-0 z-10' ref={setTooltipRef} {...getTooltipProps()}>
            <div className='bg-white rounded shadow-lg p-2'>
              <div className='text-sm font-bold'>{metric.name}</div>
              <div className='text-sm'>{parseFloat(metric.average).toFixed(2)} ms</div>
            </div>
            <div className='bg-white rounded shadow-lg p-2' {...getArrowProps({ className: 'tooltip-arrow' })} />
          </div>
        )}
    </>
  )
}