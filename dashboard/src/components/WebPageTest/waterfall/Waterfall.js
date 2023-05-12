'use client';

import { useState } from 'react';
import RequestVisual from './RequestVisual';
import RequestUrl from "./RequestUrl";
import PerformanceIndicators from "./PerformanceIndicators";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { bytesToHumanFileSize, formattedMsOrSeconds, randomNumberBetween } from "@/lib/utils";
// import WarningMessages from './WarningMessages';
import LoadingSpinner from '@/components/LoadingSpinner';

const bgKlass = ({ requestDetails, largestContentfulPaintImageUrl, index, includeHover = false }) => {
  if (requestDetails.isRenderBlocking()) {
    return `bg-red-100 ${includeHover ? 'hover:bg-red-200' : ''}`;
  } else if (requestDetails.url() === largestContentfulPaintImageUrl) {
    return `bg-yellow-100 ${includeHover ? 'hover: bg-yellow-200' : ''}`;
  } else if (index % 2 === 0) {
    return `bg-gray-50 ${includeHover ? 'hover:bg-gray-100' : ''}`;
  } else {
    return `bg-white ${includeHover ? 'hover:bg-gray-50' : ''}`;
  }
}

export default function Waterfall({ requestData, performanceData, largestContentfulPaintImageUrl, isRunning }) {
  const [expandedRequestIds, setExpandedRequestIds] = useState([]);
  const lastTimestampInData = Math.max(
    requestData ? requestData[requestData.length - 1].downloadEnd() : undefined,
    performanceData?.TimeToFirstByte,
    performanceData?.domInteractive,
    performanceData?.domContentLoadedEventEnd,
    performanceData?.domComplete,
    performanceData?.firstContentfulPaint,
    performanceData?.LargestContentfulPaint,
  )
  const lastTimestamp = Math.ceil(lastTimestampInData) + 1_000;
  
  return (
    <>
      {isRunning ? (
        <div className='text-center p-6'>
          <h2 className='text-xl text-gray-700'>Speed audit is running...</h2>
          <h2 className='text-md text-gray-500'>This may take a few minutes.</h2>
          <div className='w-fit m-auto mt-4'>
            <LoadingSpinner size={8} />
          </div>
        </div>
        ) : !requestData 
         ? <Skeleton />
          : (
          <>
            {/* <WarningMessages requestData={requestData} lcpImageURL={largestContentfulPaintImageUrl} lcpValue={performanceData?.LargestContentfulPaint} /> */}
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
                  <>
                    <div 
                      className={`cursor-default h-10 p-2 inline-block border-r border-gray-200 relative w-full flex items-center ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i })}`}
                      key={i}
                    >
                      <RequestUrl requestDetails={requestDetails} />
                    </div>
                    {expandedRequestIds.includes(requestDetails.id()) && <div className={`h-44 ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i }) }`} />}
                  </>
                ))}
              </div>
              <div className='col-span-1'>
                <div className='h-10' />
                {requestData && requestData.map((requestDetails, i) => (
                  <>
                    <div 
                      className={`overflow-x-scroll text-sm h-10 h-10 text-gray-700 cursor-default p-2 inline-block border-r border-gray-200 overflow-x-hidden whitespace-nowrap flex items-center ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i })}`}
                      key={i}
                    >
                      {bytesToHumanFileSize(requestDetails.size())} 
                      {requestDetails.isRenderBlocking() && <span className='bg-red-200 border border-red-500 text-red-500 ml-1 rounded px-1'>Render Blocking</span>}
                    </div>
                    {expandedRequestIds.includes(requestDetails.id()) && <div className={`h-44 ${bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i }) }`} />}
                  </>
                ))}
              </div>
              <div className='col-span-6 overflow-x-scroll'>
                <RequestVisualArea
                  requestData={requestData}
                  performanceData={performanceData}
                  largestContentfulPaintImageUrl={largestContentfulPaintImageUrl}
                  lastTimestamp={lastTimestamp}
                  onExpand={id => expandedRequestIds.includes(id) ? setExpandedRequestIds(expandedRequestIds.filter(i => i !== id)) : setExpandedRequestIds([...expandedRequestIds, id])}
                  expandedRequestIds={expandedRequestIds}
                />
              </div>
            </div>
          </>
          )
      }
    </>
  )
}

const RequestVisualArea = ({ requestData, performanceData, largestContentfulPaintImageUrl, lastTimestamp, onExpand, expandedRequestIds }) => {
  const numSecondsToDisplay = lastTimestamp / 1000;
  return (
    <>
      <div className='whitespace-nowrap h-10'>
        {Array.from({ length: numSecondsToDisplay }).map((_, i) => (
          <div 
            className='inline-block relative h-full text-xs text-gray-700 text-right w-0' 
            style={{ width: `${100 / numSecondsToDisplay}%` }}
            key={i}
          >
            <span className='absolute bottom-0 right-0'>{i + 1}s</span>
          </div>
        ))}
      </div>
      <div className='relative w-full request-visual-row'>
        {performanceData && <PerformanceIndicators performanceData={performanceData} lastTimestamp={lastTimestamp} />}
          {Array.from({ length: numSecondsToDisplay }).map((_, i) => (
            <div
              className='absolute border-r border-gray-300 h-full top-0 second-indicator w-0'
              key={i}
              style={{ 
                marginLeft: `${100 / numSecondsToDisplay * (i + 1)}%`,
                zIndex: 20
              }}
            />
          ))}
        {requestData && requestData.map((requestDetails, i) => (
          <RequestVisualRow 
            requestDetails={requestDetails} 
            largestContentfulPaintImageUrl={largestContentfulPaintImageUrl} 
            lastTimestamp={lastTimestamp} 
            isExpanded={expandedRequestIds.includes(requestDetails.id())}
            onClick={() => onExpand(requestDetails.id())}
            backgroundColor={bgKlass({ requestDetails, largestContentfulPaintImageUrl, index: i, includeHover: true })}
            key={i} 
          />
        ))}
      </div>
    </>
  )
}

const RequestVisualRow = ({ requestDetails, largestContentfulPaintImageUrl, lastTimestamp, isExpanded, onClick, backgroundColor }) => {
  const REQUEST_COLORS_DICT = {
    Document: {
      request: 'bg-blue-500',
      response: 'bg-blue-700',
    },
    Stylesheet: {
      request: 'bg-purple-500',
      response: 'bg-purple-700',
    },
    Script: {
      request: 'bg-orange-400',
      response: 'bg-orange-600',
    },
    XHR: {
      request: 'bg-green-500',
      response: 'bg-green-700',
    },
    Ping: {
      request: 'bg-green-500',
      response: 'bg-green-700',
    },
    Font: {
      request: 'bg-pink-500',
      response: 'bg-pink-700',
    },
    Image: {
      request: 'bg-red-500',
      response: 'bg-red-700',
    }
  }

  return (
    <>
      <div
        className={`w-full relative h-10 py-2 inline-block border-r border-gray-200 cursor-pointer overflow-x-hidden whitespace-nowrap flex items-center cursor-pointer hover:opacity-80 ${backgroundColor}`}
        onClick={onClick}
      >
        <RequestVisual
          requestDetails={requestDetails}
          isLCP={requestDetails.url() === largestContentfulPaintImageUrl}
          lastTimestamp={lastTimestamp}
        />
      </div>
      {isExpanded && (
        <div className='h-44 flex items-center relative p-2'>
          <div className={`absolute top-0 left-0 w-full h-full z-50 ${backgroundColor}`}>
            <h4 className='text-md'>Request details:</h4>
            <div className='text-sm'>
              <div>
                <div className='bg-teal-600 h-4 w-4 rounded inline-block' />
                <div className='inline-block ml-2'>DNS: {formattedMsOrSeconds(requestDetails.dnsTime())}</div>
              </div>
              <div>
                <div className='bg-orange-500 h-4 w-4 rounded inline-block' />
                <div className='inline-block ml-2'>Connect: {formattedMsOrSeconds(requestDetails.connectTime())}</div>
              </div>
              <div>
                <div className='bg-pink-500 h-4 w-4 rounded inline-block' />
                <div className='inline-block ml-2'>SSL: {formattedMsOrSeconds(requestDetails.sslTime())}</div>
              </div>
              <div>
                <div className={`${REQUEST_COLORS_DICT[requestDetails.requestType()]?.request || 'bg-blue-500'} h-4 w-4 rounded inline-block`} />
                <div className='inline-block ml-2'>Request: {formattedMsOrSeconds(requestDetails.ttfbTime())}</div>
              </div>
              <div>
                <div className={`${REQUEST_COLORS_DICT[requestDetails.requestType()]?.response || 'bg-blue-700'} h-4 w-4 rounded inline-block`} />
                <div className='inline-block ml-2'>Response: {formattedMsOrSeconds(requestDetails.downloadTime())}</div>
              </div>
              <div>
                <div className='inline-block font-bold'>Total Duration: {formattedMsOrSeconds(requestDetails.allMs())}</div>
              </div>
            </div>
          </div>
        </div>
      )}
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

const Skeleton = () => {
  const numSecondsToDisplay = 10;
  const numRowsToDisplay = 30;
  return (
    <>
      <div className='grid grid-cols-10'>
        <div className='col-span-1'/>
        <div className='col-span-1'/>
        <div className='col-span-8'>
          {Array.from({ length: numSecondsToDisplay }).map((_, i) => (
            <div
              className='inline-block text-xs text-gray-700 text-right'
              style={{ width: `${100 / numSecondsToDisplay}%` }}
              key={i}
            >
              <span className='-mr-2'>{i + 1}s</span>
            </div>
          ))}
        </div>
      </div>
      <div className='grid grid-cols-10 border border-gray-200 rounded'>
        {Array.from({ length: numRowsToDisplay }).map((_, i) => (
          <>
            <div className={`col-span-1 h-10 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`} key={`url-${i}`}>
              <div className='h-full w-full'>
                <div className={`h-1/2 mt-[10%] ml-2 bg-gray-200 animate-pulse rounded`} style={{ width: `${randomNumberBetween(25, 90)}%` }} />
              </div>
            </div>
            <div className={`col-span-1 h-10 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`} key={`bytes-${i}`}>
              <div className={`h-1/2 mt-[10%] ml-2 bg-gray-200 animate-pulse rounded`} style={{ width: `${randomNumberBetween(25, 90)}%` }} />
            </div>
            <div className={`col-span-8 h-10 overflow-hidden ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`} key={`visual-${i}`}>
              <div
                className={`h-1/2 mt-[1%] bg-gray-200 animate-pulse rounded`}
                style={{ 
                  width: `${randomNumberBetween(5, 50)}%`,
                  marginLeft: `${Math.min(75, randomNumberBetween(0, i))}%` 
                }}
              />
            </div>
          </>
        ))}
      </div>
    </>
  )
}