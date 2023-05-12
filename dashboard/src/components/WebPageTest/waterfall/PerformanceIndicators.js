import { formattedMsOrSeconds } from "@/lib/utils";
import { usePopperTooltip } from "react-popper-tooltip";

const COLORS_DICT = {
  'DOM Interactive': 'blue',
  'DOM Content Loaded': 'green',
  'DOM Complete': 'purple',
  'First Contentful Paint': 'yellow',
  'Largest Contentful Paint': 'orange',
  'Time to First Byte': 'red',
}

export default function PerformanceIndicators({ performanceData, lastTimestamp }) {
  return (
    <>
      {performanceData && (
        <>
          <PerformanceIndicator name='Time to First Byte' value={performanceData.TimeToFirstByte} lastTimestamp={lastTimestamp} />
          <PerformanceIndicator name='DOM Interactive' value={performanceData.domInteractive} lastTimestamp={lastTimestamp} />
          <PerformanceIndicator name='DOM Content Loaded' value={performanceData.domContentLoadedEventEnd} lastTimestamp={lastTimestamp} />
          <PerformanceIndicator name='DOM Complete' value={performanceData.domComplete} lastTimestamp={lastTimestamp} />
          <PerformanceIndicator name='First Contentful Paint' value={performanceData.firstContentfulPaint} lastTimestamp={lastTimestamp} />
          <PerformanceIndicator name='Largest Contentful Paint' value={performanceData.LargestContentfulPaint} lastTimestamp={lastTimestamp} />
        </>
      )}
    </>
  )
}

const PerformanceIndicator = ({ name, value, lastTimestamp }) => {
  const { visible, getTooltipProps, setTooltipRef, setTriggerRef, getArrowProps } = usePopperTooltip({ followCursor: true });
  return (
    <>
      <div 
        className='absolute top-0'
        ref={setTriggerRef}
        style={{ 
          // marginLeft: `calc(${MARGIN_BUFFER} + ${value * pixelToMsRatio}px)`,
          marginLeft: `${value / lastTimestamp * 100 }%`,
          width: 0,
          borderRight: `3px dotted ${COLORS_DICT[name] || 'blue'}`,
          height: '100%',
          zIndex: 30
        }} 
      />
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='text-xs'>
            {name}: {formattedMsOrSeconds(value)}
          </div>
        </div>
      )}
    </>
  )
}