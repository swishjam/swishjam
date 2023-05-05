import { useState, useRef, useEffect } from "react";
import { cwvMetricBounds } from "@/lib/cwvCalculations";
import { formattedMsOrSeconds } from "@/lib/utils";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const METRIC_NAME_TO_HUMAN_NAME_DICT = {
  'first_contentful_paint': 'First Contentful Paint',
  'first_input_delay': 'First Input Delay',
  'largest_contentful_paint': 'Largest Contentful Paint',
  'cumulative_layout_shift': 'Cumulative Layout Shift',
  'experimental_time_to_first_byte': 'Time to First Byte',
  'experimental_interaction_to_next_paint': 'Interaction to Next Paint'
};

const METRIC_NAME_TO_ACCRONYM_DICT = {
  'first_contentful_paint': 'FCP',
  'first_input_delay': 'FID',
  'largest_contentful_paint': 'LCP',
  'cumulative_layout_shift': 'CLS',
  'experimental_time_to_first_byte': 'TTFB',
  'experimental_interaction_to_next_paint': 'INP'
};

function P75Indicator({ p75Value, upperBound, lowerBound, humanMetricName, isHovered, textColor }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover', placement: 'top' });
  const marginLeft = Math.min(100, (p75Value - lowerBound) / (upperBound - lowerBound) * 100);

  return (
    <>
      <div
        className={`h-[150%] text-xs text-right absolute w-0 bottom-0 left-0 border-r border-dashed border-slate-600 ${isHovered ? 'border-r-2 font-bold' : 'font-medium'} ${textColor}`}
        style={{ marginLeft: `${marginLeft}%` }}
        ref={setTriggerRef}
      >
        <span className='px-1 whitespace-nowrap'>{humanMetricName === 'Cumulative Layout Shift' ? parseFloat(parseFloat(p75Value).toFixed(4)) : formattedMsOrSeconds(p75Value)}</span>
      </div>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='tooltip-text'>
            <div className='text-xs text-gray-700'>
              75% of visitors receive a {humanMetricName} of {humanMetricName === 'Cumulative Layout Shift' ? parseFloat(parseFloat(p75Value).toFixed(4)) : formattedMsOrSeconds(p75Value)} or less.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StartEndTimes({ isVisible, textColor, startTime, endTime }) {
  const startTimeRef = useRef();
  const endTimeRef = useRef();

  useEffect(() => {
    if (startTimeRef.current && endTimeRef.current) {
      const startTimeRect = startTimeRef.current.getBoundingClientRect();
      const endTimeRect = endTimeRef.current.getBoundingClientRect();
      const numOverlappingPixels = startTimeRect.right - endTimeRect.left;
      if (numOverlappingPixels > 0) {
        const bufferPx = 2.5;
        startTimeRef.current.style.marginLeft = `-${(numOverlappingPixels / 2) + bufferPx}px`;
        endTimeRef.current.style.marginRight = `-${(numOverlappingPixels / 2) + bufferPx}px`;
      }
    }
  }, [isVisible])

  return isVisible && (
    <>
      <div className={`absolute bottom-0 left-0 h-full -mb-10 text-xs font-medium whitespace-nowrap ${textColor}`} ref={startTimeRef}>
        {startTime}
      </div>
      <div className={`absolute bottom-0 right-0 h-full -mb-10 text-xs font-medium whitespace-nowrap ${textColor}`} ref={endTimeRef}>
        {endTime}
      </div>
    </>
  )
}

function BarComponent({ percentInBar, barType, metric, displayP75Indicator, p75Value }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover', placement: 'top' });

  const [isHovered, setIsHovered] = useState(false);
  const bgKlass = barType === 'good' ? 'bg-green-500 hover:bg-green-600' : barType === 'needs improvement' ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-red-500 hover:bg-red-600';
  const textColor = barType === 'good' ? 'text-green-700' : barType === 'needs improvement' ? 'text-yellow-600' : 'text-red-700';
  const cwvBoundsForMetric = cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]];

  const formattedMetricValue = val => metric === 'cumulative_layout_shift' ? parseFloat(parseFloat(val).toFixed(4)) : formattedMsOrSeconds(val);

  return (
    <>
      <div 
        className={`h-full relative cursor-default overflow-x-hidden inline-flex flex-grow items-center justify-center hover:z-10 hover:outline hover:outline-2 hover:outline-swishjam duration-300 transition ${bgKlass}`}
        style={{ width: `${percentInBar}%`, overflow: 'visible' }}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        ref={setTriggerRef}
      >
        <StartEndTimes
          isVisible={isHovered}
          textColor={textColor}
          startTime={
            barType === 'good'
              ? 0
              : barType === 'needs improvement'
                ? formattedMetricValue(cwvBoundsForMetric.good)
                : formattedMetricValue(cwvBoundsForMetric.medium)}
          endTime={
            barType === 'good'
              ? formattedMetricValue(cwvBoundsForMetric.good)
              : barType === 'needs improvement'
                ? formattedMetricValue(cwvBoundsForMetric.medium)
                : formattedMetricValue(cwvBoundsForMetric.medium + (cwvBoundsForMetric.medium - cwvBoundsForMetric.good))
          }
        />
        {displayP75Indicator && (
          <P75Indicator
            p75Value={p75Value}
            upperBound={
              barType === 'good' 
                ? cwvBoundsForMetric.good 
                : barType === 'needs improvement' 
                  ? cwvBoundsForMetric.medium 
                  : cwvBoundsForMetric.medium + (cwvBoundsForMetric.medium - cwvBoundsForMetric.good)
            }
            lowerBound={
              barType === 'good'
                ? 0
                : barType === 'needs improvement'
                  ? cwvBoundsForMetric.good
                  : cwvBoundsForMetric.medium
            }
            isHovered={isHovered}
            humanMetricName={METRIC_NAME_TO_HUMAN_NAME_DICT[metric]}
            textColor={textColor}
          />
        )}
        {percentInBar >= 10 && (
          <div className='text-xs text-white font-semibold'>
            {parseFloat(percentInBar).toFixed(2)}%
          </div>
        )}
      </div>
      {percentInBar < 10 && visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='tooltip-text'>
            <div className='text-xs text-gray-700'>
            {parseFloat(percentInBar).toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function CruxMetricGoodNeedsImprovementPoorChart({ histogramTimeseries, p75Value, indexToVisualize, metric }) {
  const cwvBoundsForMetric = cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]];
  const p75Grade = p75Value < cwvBoundsForMetric.good ? 'good' : p75Value < cwvBoundsForMetric.medium ? 'needs improvement' : 'poor';
  const barType = index => index === 0 ? 'good' : index === 1 ? 'needs improvement' : 'poor';
  const shouldDisplayP75Indicator = index => (
    barType(index) === 'good' && p75Grade === 'good'
      || barType(index) === 'needs improvement' && p75Grade === 'needs improvement'
      || barType(index) === 'poor' && p75Grade === 'poor'
  )

  return (
    <div className='w-full flex h-10'>
      {histogramTimeseries.map(({ densities }, i) => (
        typeof densities[indexToVisualize] === 'number' ? (
          <BarComponent 
            key={i}
            barType={barType(i)}
            percentInBar={densities[indexToVisualize] * 100}
            metric={metric}
            p75Value={shouldDisplayP75Indicator(i) && p75Value}
            displayP75Indicator={shouldDisplayP75Indicator(i)}
          />
        ) : i === 0 ? (
          <div key={i} className='w-full bg-gray-300 flex items-center justify-center text-sm'>No data for timeperiod</div>
        ) : null
      ))}
    </div>
  )
}