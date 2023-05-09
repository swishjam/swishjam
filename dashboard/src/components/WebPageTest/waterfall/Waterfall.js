'use client';

import { useState } from 'react';
import RequestVisual from './RequestVisual';
import RequestUrl from "./RequestUrl";
import PerformanceIndicators from "./PerformanceIndicators";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { bytesToHumanFileSize, formattedMsOrSeconds } from "@/lib/utils";
import WarningMessages from './WarningMessages';

const bgKlass = ({ requestDetails, largestContentfulPaintImageUrl, index }) => {
  if (requestDetails.isRenderBlocking()) {
    return 'bg-red-100';
  } else if (requestDetails.url() === largestContentfulPaintImageUrl) {
    return 'bg-yellow-100';
  } else if (index % 2 === 0) {
    return 'bg-gray-50';
  } else {
    return 'bg-white';
  }
}

export default function Waterfall({ requestData, performanceData, pixelToMsRatio, mostLikelyLastTimestamp, largestContentfulPaintImageUrl }) {
  return (
    <>
      {requestData === undefined 
        ? <Skeleton pixelToMsRatio={pixelToMsRatio} />
        : (
        <>
          <WarningMessages requestData={requestData} lcpImageURL={largestContentfulPaintImageUrl} lcpValue={performanceData?.LargestContentfulPaint} />
          <div className='grid grid-cols-10 flex justify-baseline items-center m-auto'>
            <LegendItem text='Waiting' color='bg-red-100' type='full' />
            <LegendItem text='DNS Lookup' color='bg-teal-600' type='full' />
            <LegendItem text='Connect' color='bg-orange-500' type='full' />
            <LegendItem text='SSL' color='bg-pink-500' type='full' />
            <LegendItem text='Document' leftColor='bg-blue-500' rightColor='bg-blue-700' type='half' />
            <LegendItem text='CSS' leftColor='bg-purple-500' rightColor='bg-purple-700' type='half' />
            <LegendItem text='JavaScript' leftColor='bg-orange-500' rightColor='bg-orange-700' type='half' />
            <LegendItem text='XHR' leftColor='bg-green-500' rightColor='bg-green-700' type='half' />
            <LegendItem text='Font' leftColor='bg-pink-500' rightColor='bg-pink-700' type='half' />
            <LegendItem text='Image' leftColor='bg-red-500' rightColor='bg-red-700' type='half' />
          </div>
          <div className='grid grid-cols-6 gap-1 flex justify-baseline items-center max-w-3xl m-auto mt-2'>
            <PerformanceLegendItem text='TTFB' color='red' value={performanceData?.TimeToFirstByte} />
            <PerformanceLegendItem text='FCP' color='yellow' value={performanceData?.firstContentfulPaint} />
            <PerformanceLegendItem text='LCP' color='orange' value={performanceData?.LargestContentfulPaint} />
            <PerformanceLegendItem text='DOM Interactive' color='blue' value={performanceData?.domInteractive} />
            <PerformanceLegendItem text='DOM Content Loaded' color='green' value={performanceData?.domContentLoadedEventEnd} />
            <PerformanceLegendItem text='DOM Complete' color='purple' value={performanceData?.domComplete} />
          </div>
          <div className='grid grid-cols-8'>
            <div className='col-span-1'>
              <div className='h-10' />
              {requestData && requestData.map((requestDetails, i) => (
                <div 
                  className={`cursor-default h-10 p-2 inline-block border-r border-gray-200 relative w-full flex items-center ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i })}`}
                  key={i}
                >
                  <RequestUrl requestDetails={requestDetails} key={i} />
                </div>
              ))}
            </div>
            <div className='col-span-1'>
              <div className='h-10' />
              {requestData && requestData.map((requestDetails, i) => (
                <div 
                  className={`overflow-x-scroll text-sm h-10 text-gray-700 cursor-default p-2 inline-block border-r border-gray-200 overflow-x-hidden whitespace-nowrap flex items-center ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i })}`}
                  key={i}
                >
                  {bytesToHumanFileSize(requestDetails.size())} 
                  {requestDetails.isRenderBlocking() && <span className='bg-red-200 border border-red-500 text-red-500 ml-1 rounded px-1'>Render Blocking</span>}
                </div>
              ))}
            </div>
            <div className='col-span-6 overflow-x-scroll'>
              <RequestVisualArea
                requestData={requestData}
                performanceData={performanceData}
                pixelToMsRatio={pixelToMsRatio}
                mostLikelyLastTimestamp={mostLikelyLastTimestamp}
                largestContentfulPaintImageUrl={largestContentfulPaintImageUrl}
              />
            </div>
          </div>
        </>
        )
      }
    </>
  )
}

const RequestVisualArea = ({ requestData, pixelToMsRatio, performanceData, mostLikelyLastTimestamp, largestContentfulPaintImageUrl }) => {
  return (
    <>
      <div className='whitespace-nowrap h-10'>
        {Array.from({ length: Math.ceil(mostLikelyLastTimestamp / 1000) + 1 }).map((_, i) => (
          <div 
            className='inline-block relative h-full text-xs text-gray-700 text-right' 
            style={{ width: `${1_000 * pixelToMsRatio}px` }}
            key={i}
          >
            <span className='absolute bottom-0 right-0'>{i + 1}s</span>
          </div>
        ))}
      </div>
      <div className='relative w-full request-visual-row'>
        {performanceData && <PerformanceIndicators performanceData={performanceData} pixelToMsRatio={pixelToMsRatio} />}
          {Array.from({ length: Math.ceil(mostLikelyLastTimestamp / 1000) + 1 }).map((_, i) => (
            <div
              className='absolute border-r border-gray-300 h-full top-0 second-indicator'
              style={{ 
                width: `${1_000 * pixelToMsRatio}px`, 
                marginLeft: `${1_000 * pixelToMsRatio * i}px`,
                zIndex: 20
              }}
              key={i}
            />
          ))}
        {requestData && requestData.map((requestDetails, i) => (
          <div 
            className={`min-w-full relative h-10 cursor-default py-2 inline-block border-r border-gray-200 overflow-x-hidden whitespace-nowrap flex items-center ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i })}`}
            style={{ width: `${(Math.ceil(mostLikelyLastTimestamp / 1_000 + 1) * 1_000) * pixelToMsRatio}px` }}
            key={i}
          >
            <RequestVisual 
              requestDetails={requestDetails} 
              pixelToMsRatio={pixelToMsRatio} 
              isLCP={requestDetails.url() === largestContentfulPaintImageUrl}
            />
          </div>
        ))}
      </div>
    </>
  )
}

const PerformanceLegendItem = ({ text, color, value }) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  return (
    <>
      <div className='text-xs text-gray-700 text-center px-4 cursor-default' ref={setTriggerRef}>
        {text}
        <div className='border-t-8 border-dotted' style={{ borderColor: `${color}` }} />
      </div>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'z-50' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='bg-white text-xs text-gray-700 border border-gray-200 rounded-md p-2 z-50'>
            {formattedMsOrSeconds(value)}
          </div>
        </div>
      )}
    </>
  )
}

const LegendItem = ({ text, color, leftColor, rightColor, type }) => (
  <div className='mx-1 text-center'>
    <span className='block text-xs text-gray-700'>{text}</span>
    {type === 'full' 
      ? <div className={`${color} w-full h-4 rounded`} />
      : type === 'half'
        ? <>
            <div className={`${leftColor} w-1/2 h-4 rounded-l inline-block`} />
            <div className={`${rightColor} w-1/2 h-4 rounded-r inline-block`} />
        </>
        : <>
          <div className={`${color} w-full border border-dotted border-blue-700 rounded-l inline-block`} />
        </>}
  </div>
)

const Skeleton = ({ pixelToMsRatio }) => {
  return (
    <div className='flex justify-center'>
      <div>
        <div className='w-44 inline-block' />
        <div className='w-20 inline-block' />
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            className='inline-block text-xs text-gray-700 text-right'
            style={{ width: `${1_000 * pixelToMsRatio}px` }}
            key={i}
          >
            <span className='-mr-2'>{i + 1}s</span>
          </div>
        ))}
        <div className='w-full border border-gray-200 rounded'>
          <div className='w-full overflow-x-scroll relative'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div className={`h-10 flex items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`} key={i}>
                <div className={`w-44 h-4 inline-block ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <div className={`h-[80%] ml-2 w-${['36', '32', '28', '24', '20', '12', '8'][Math.floor(Math.random() * 7)]} bg-gray-200 rounded`} />
                </div>
                <div className={`w-20 h-4 inline-block ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <div className={`h-[80%] ml-2 w-${['16', '14', '12', '10', '8'][Math.floor(Math.random() * 5)]} bg-gray-200 rounded`} />
                </div>
                <div className='relative'>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div 
                      className={`inline-block h-full ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`} 
                      style={{ width: `${1_000 * pixelToMsRatio}px` }} 
                      key={j}
                    />
                  ))}
                  <div 
                    className={`absolute top-0 h-4 m-1 w-${['16', '12', '10', '8'][Math.floor(Math.random() * 4)]} bg-gray-200 rounded`} 
                    style={{ left: `${Math.min(75, Math.random() * 9 * i)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}