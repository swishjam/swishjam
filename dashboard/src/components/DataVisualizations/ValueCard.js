"use client"

import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon } from "@heroicons/react/24/outline";
import defineComponentAsDataVisualization from "./DataVisualizationWrapper";
import useResizeObserver from "@/hooks/useResizeObserver";
import { useEffect, useRef } from "react";
import useDataVisualizationSettings from "@/hooks/useDataVisualizationSettings";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BanIcon, HashIcon, PercentIcon } from "lucide-react";

const ValueCard = ({
  comparisonFormat: providedComparisonFormat = 'value',
  increaseFromComparisonValueIsPositive: providedIncreaseFromComparisonValueIsPositive = true,
  maxFontSize = 100,
  previousValue,
  previousValueDate,
  resizeValueBasedOnHeight: providedResizeValueBasedOnHeight = true,
  textAlignment: providedTextAlignment = 'left',
  value,
  valueFormatter = val => val,
}) => {
  const { updateSettings, getSetting } = useDataVisualizationSettings();
  const containerRef = useRef();
  const resizeObserverDebounceRef = useRef();
  const valueTextRef = useRef();
  const comparisonValueTextRef = useRef();
  const comparisonIconRef = useRef();

  const comparisonFormat = getSetting('comparison-value-format');
  const increaseFromComparisonValueIsPositive = getSetting('increase-from-comparison-is-positive');
  const resizeValueBasedOnHeight = getSetting('dynamic-font-size');
  const textAlignment = getSetting('text-alignment');

  const changeInValue = previousValue !== undefined ? value - previousValue : null;

  useResizeObserver(containerRef, () => {
    clearTimeout(resizeObserverDebounceRef.current);
    resizeObserverDebounceRef.current = setTimeout(updateFontSizeBasedOnHeight, 25);
  }, { enabled: resizeValueBasedOnHeight })

  useEffect(() => {
    updateSettings([
      { id: 'comparison-value-format', value: providedComparisonFormat },
      { id: 'increase-from-comparison-is-positive', value: providedIncreaseFromComparisonValueIsPositive },
      { id: 'dynamic-font-size', value: providedResizeValueBasedOnHeight },
      { id: 'text-alignment', value: providedTextAlignment },
    ])
  }, [providedComparisonFormat, providedIncreaseFromComparisonValueIsPositive, providedResizeValueBasedOnHeight, providedTextAlignment])

  useEffect(() => {
    if (resizeValueBasedOnHeight && containerRef.current) {
      updateFontSizeBasedOnHeight();
    } else if (!resizeValueBasedOnHeight) {
      if (valueTextRef.current) {
        valueTextRef.current.style.fontSize = '';
      }
      if (comparisonValueTextRef.current) {
        comparisonValueTextRef.current.style.fontSize = '';
      }
      if (comparisonIconRef.current) {
        comparisonIconRef.current.style.height = '';
        comparisonIconRef.current.style.width = '';
      }
    }
  }, [resizeValueBasedOnHeight, containerRef.current, comparisonValueTextRef.current, comparisonIconRef.current, valueTextRef.current])

  const updateFontSizeBasedOnHeight = () => {
    if (!containerRef.current) {
      return;
    }
    const height = containerRef.current.getBoundingClientRect().height;

    if (valueTextRef.current) {
      const valueTextFontSize = Math.max(
        25,
        Math.min(height * 0.75, maxFontSize),
      )
      valueTextRef.current.style.fontSize = `${valueTextFontSize}px`;
    }

    if (comparisonValueTextRef.current) {
      const comparisonValueTextFontSize = Math.max(
        12,
        Math.min(height * 0.3, maxFontSize * 0.2),
      )
      comparisonValueTextRef.current.style.fontSize = `${comparisonValueTextFontSize}px`;
    }

    if (comparisonIconRef.current) {
      const comparisonIconDimension = Math.max(
        12,
        Math.min(height * 0.3, maxFontSize * 0.2),
      )
      comparisonIconRef.current.style.height = `${comparisonIconDimension}px`;
      comparisonIconRef.current.style.width = `${comparisonIconDimension}px`;
    }
  }

  return (
    <div
      className={`flex flex-1 items-center ${textAlignment === 'center' ? 'justify-center' : textAlignment === 'right' ? 'justify-end' : 'justify-start'}`}
      ref={containerRef}
    >
      <div
        className="text-2xl font-bold cursor-default transition-all duration-100"
        ref={valueTextRef}
      >
        {valueFormatter(value)}
      </div>
      {(comparisonFormat !== 'none' && changeInValue && changeInValue !== 0) && (
        <HoverCard>
          <HoverCardTrigger className='block w-fit ml-2 pt-2'>
            <p className="text-xs text-muted-foreground cursor-default transition-all duration-100">
              {changeInValue < 0
                ? (
                  <ArrowTrendingDownIcon
                    className={`h-4 w-4 inline-block mr-1 ${increaseFromComparisonValueIsPositive ? 'text-red-500' : 'text-green-500'}`}
                    ref={comparisonIconRef}
                  />
                )
                : (
                  <ArrowTrendingUpIcon
                    className={`h-4 w-4 inline-block mr-1 ${increaseFromComparisonValueIsPositive ? 'text-green-500' : 'text-red-500'}`}
                    ref={comparisonIconRef}
                  />
                )}
              <span
                className='underline decoration-dotted'
                ref={comparisonValueTextRef}
              >
                {comparisonFormat === 'percent' ? `${Math.abs((changeInValue / previousValue) * 100).toFixed(2)}%` : valueFormatter(changeInValue)}
              </span>
            </p>
          </HoverCardTrigger>
          <HoverCardContent className='flex items-center text-gray-500'>
            <CalendarIcon className="h-6 w-6 inline-block mr-2" />
            <span className='text-xs'>
              {new Date(previousValueDate).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}: {valueFormatter(previousValue)}
            </span>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  )
}

export default defineComponentAsDataVisualization(ValueCard, {
  loadingDetectionProp: 'value',
  settings: [
    {
      id: 'text-alignment',
      label: 'Text Alignment',
      options: [
        {
          label: (
            <span className='flex items-center justify-between'>
              <span>Left</span>
              <AlignLeftIcon className='h-3 w-3' />
            </span>
          ),
          value: 'left'
        },
        {
          label: (
            <span className='flex items-center justify-between'>
              <span>Center</span>
              <AlignCenterIcon className='h-3 w-3' />
            </span>
          ),
          value: 'center'
        },
        {
          label: (
            <span className='flex items-center justify-between'>
              <span>Right</span>
              <AlignRightIcon className='h-3 w-3' />
            </span>
          ),
          value: 'right'
        },
      ]
    },
    {
      id: 'comparison-value-format',
      label: 'Comparison Format',
      options: [
        {
          label: (
            <span className='flex items-center justify-between'>
              <span>Value</span>
              <HashIcon className='h-3 w-3' />
            </span>
          ),
          value: 'value'
        },
        {
          label: (
            <span className='flex items-center justify-between'>
              <span>Percent</span>
              <PercentIcon className='h-3 w-3' />
            </span>
          ),
          value: 'percent'
        },
        {
          label: (
            <span className='flex items-center justify-between'>
              <span>None</span>
              <BanIcon className='h-3 w-3' />
            </span>
          ),
          value: 'none'
        },
      ]
    },
    {
      id: 'dynamic-font-size',
      label: 'Dynamic Font Size',
    },
    {
      id: 'increase-from-comparison-is-positive',
      label: 'Increase from Comparison is Positive',
    }
  ]
})