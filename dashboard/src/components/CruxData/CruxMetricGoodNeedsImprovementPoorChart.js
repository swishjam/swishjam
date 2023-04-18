import { useState } from "react";
import { cwvMetricBounds } from "@/lib/cwvCalculations";
import { formattedMsOrSeconds } from "@/lib/utils";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

export default function CruxMetricGoodNeedsImprovementPoorChart({ 
  histogramTimeseries, 
  p75Value, 
  indexToVisualize, 
  indexOfScoreToHighlight,
  metric
}) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover', placement: 'top' });
  const [hoveredIndex, setHoveredIndex] = useState(indexOfScoreToHighlight);
  const accronym = {
    'first_contentful_paint': 'FCP',
    'first_input_delay': 'FID',
    'largest_contentful_paint': 'LCP',
    'cumulative_layout_shift': 'CLS',
    'experimental_time_to_first_byte': 'TTFB',
    'experimental_interaction_to_next_paint': 'INP'
  }[metric];
  const humanMetricName = {
    'first_contentful_paint': 'First Contentful Paint',
    'first_input_delay': 'First Input Delay',
    'largest_contentful_paint': 'Largest Contentful Paint',
    'cumulative_layout_shift': 'Cumulative Layout Shift',
    'experimental_time_to_first_byte': 'Time to First Byte',
    'experimental_interaction_to_next_paint': 'Interaction to Next Paint'
  }[metric];
  const cwvBoundsForMetric = cwvMetricBounds[accronym];
  const p75Grade = p75Value < cwvBoundsForMetric.good ? 'good' : p75Value < cwvBoundsForMetric.medium ? 'needs improvement' : 'poor';
  const indexForP75Indicator = p75Grade === 'good' ? 0 : p75Grade === 'needs improvement' ? 1 : 2;
  const p75MarginLeftPercent = Math.min(
    p75Grade === 'good' 
      ? (p75Value / cwvBoundsForMetric.good) * 100
      : p75Grade === 'needs improvement'
        ? ((p75Value - cwvBoundsForMetric.good) / (cwvBoundsForMetric.medium - cwvBoundsForMetric.good)) * 100 
        : ((p75Value - cwvBoundsForMetric.medium) / (cwvBoundsForMetric.medium + (cwvBoundsForMetric.medium - cwvBoundsForMetric.good))) * 100,
  100)
  return (
    <div className='w-full flex h-10'>
      {histogramTimeseries.map(({ densities }, i) => (
        typeof densities[indexToVisualize] === 'number' ? (
          <div key={i}
            className={`h-full relative cursor-default overflow-x-hidden inline-flex flex-grow items-center justify-center hover:z-10 hover:outline hover:outline-2 hover:outline-swishjam ${i === 0 ? 'bg-green-500 hover:bg-green-600' : i === 1 ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-red-500 hover:bg-red-600'}`}
            style={{ width: `${densities[indexToVisualize] * 100}%`, overflow: 'visible' }}
            onMouseOver={() => setHoveredIndex(i)}
            onMouseOut={() => setHoveredIndex(null)}
          >
            {hoveredIndex === i && <div className='absolute bottom-0 left-0 h-full -mb-10 text-xs text-gray-500 whitespace-nowrap'>{
              i === 0
                ? 0
                : i === 1
                  ? metric === 'cumulative_layout_shift' ? cwvBoundsForMetric.good : formattedMsOrSeconds(cwvBoundsForMetric.good)
                  : metric === 'cumulative_layout_shift' ? cwvBoundsForMetric.medium : formattedMsOrSeconds(cwvBoundsForMetric.medium)
            }</div>}
            {i === indexForP75Indicator && (
              <>
                <div 
                  className={`h-[150%] text-xs text-right absolute w-0 bottom-0 left-0 border-r border-gray-300 ${hoveredIndex === i ? 'border-r-2 font-bold' : 'font-medium'} ${p75Grade === 'good' ? 'text-green-600' : p75Grade === 'needs improvement' ? 'text-yellow-500' : 'text-red-600'}`} 
                  style={{ marginLeft: `${p75MarginLeftPercent}%`}}
                  ref={setTriggerRef}
                >
                  <span className='px-1 whitespace-nowrap'>{metric === 'cumulative_layout_shift' ? p75Value : formattedMsOrSeconds(p75Value)}</span>
                </div>
                {visible && (
                  <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                    <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
                    <div className='tooltip-text'>
                      <div className='text-xs text-gray-700'>
                        75% of visitors receive a {humanMetricName} of {metric === 'cumulative_layout_shift' ? p75Value : formattedMsOrSeconds(p75Value)} or less.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {hoveredIndex === i && <div className='absolute bottom-0 right-0 h-full -mb-10 text-xs text-gray-500 whitespace-nowrap'>{
              i === 0
                ? metric === 'cumulative_layout_shift' ? cwvBoundsForMetric.good : formattedMsOrSeconds(cwvBoundsForMetric.good)
                : i === 1
                  ? metric === 'cumulative_layout_shift' ? cwvBoundsForMetric.medium : formattedMsOrSeconds(cwvBoundsForMetric.medium)
                  : metric === 'cumulative_layout_shift' 
                    ? cwvBoundsForMetric.medium + cwvBoundsForMetric.medium 
                    : formattedMsOrSeconds(cwvBoundsForMetric.medium + cwvBoundsForMetric.medium)
            }</div>}
            <div className='text-xs text-white'>{densities[indexToVisualize] >= 0.1 ? `${parseFloat(densities[indexToVisualize] * 100).toFixed(2)}%` : ''}</div>
          </div>
        ) : i === 0 ? (
          <div key={i} className='w-full bg-gray-300 flex items-center justify-center text-sm'>No data for timeperiod</div>
        ) : null
      ))}
    </div>
  )
}