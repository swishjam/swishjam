import { formattedMsOrSeconds } from "@/lib/utils";
import { usePopperTooltip } from "react-popper-tooltip";

const MARGIN_BUFFER = '16rem';
const COLORS_DICT = {
  'DOM Interactive': 'blue',
  'DOM Content Loaded': 'green',
  'DOM Complete': 'purple',
  'First Contentful Paint': 'yellow',
  'Largest Contentful Paint': 'orange'
}

export default function PerformanceIndicators({ performanceData, pixelToMsRatio }) {
  return (
    <>
      {performanceData && (
        <>
          <PerformanceIndicator name='DOM Interactive' value={performanceData.domInteractive} pixelToMsRatio={pixelToMsRatio} />
          <PerformanceIndicator name='DOM Content Loaded' value={performanceData.domContentLoadedEventEnd} pixelToMsRatio={pixelToMsRatio} />
          <PerformanceIndicator name='DOM Complete' value={performanceData.domComplete} pixelToMsRatio={pixelToMsRatio} />
          <PerformanceIndicator name='First Contentful Paint' value={performanceData.firstContentfulPaint} pixelToMsRatio={pixelToMsRatio} />
          <PerformanceIndicator name='Largest Contentful Paint' value={performanceData.LargestContentfulPaint} pixelToMsRatio={pixelToMsRatio} />
        </>
      )}
    </>
  )
}

const PerformanceIndicator = ({ name, value, pixelToMsRatio }) => {
  const { visible, getTooltipProps, setTooltipRef, setTriggerRef, getArrowProps } = usePopperTooltip({ followCursor: true });
  return (
    <>
      <div 
        className='absolute top-0'
        ref={setTriggerRef}
        style={{ 
          marginLeft: `calc(${MARGIN_BUFFER} + ${value * pixelToMsRatio}px)`,
          width: 0,
          borderRight: `2px solid ${COLORS_DICT[name] || 'blue'}`,
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