'use client';

import RequestRow from "./RequestRow";
import PerformanceIndicators from "./PerformanceIndicators";

export default function Waterfall({ requestData, performanceData, largestContentfulPaintImageUrl }) {
  const mostLikelyLastTimestamp = requestData?.[requestData.length - 1]?.download_end;
  const PIXEL_TO_MS_RATIO = 0.05;
  // const PIXEL_TO_MS_RATIO = (mostLikelyLastTimestamp || 16_000) * 0.000025; // we should make this dynamic

  return (
    <>
    {requestData === undefined 
      ? <Skeleton pixelToMsRatio={PIXEL_TO_MS_RATIO} />
      : (
        <div className='flex justify-center'>
          <div>
            <div className='w-44 inline-block' />
            <div className='w-20 inline-block' />
            {Array.from({ length: Math.ceil(mostLikelyLastTimestamp / 1000) - 1 }).map((_, i) => (
              <div 
                className='inline-block text-xs text-gray-700 text-right' 
                style={{ width: `${1_000 * PIXEL_TO_MS_RATIO}px` }}
                key={i}
              >
                <span className='-mr-2'>{i + 1}s</span>
              </div>
            ))}
            <div className='w-full border border-gray-200 rounded'>
              <div className='w-full overflow-x-scroll relative'>
                {performanceData && <PerformanceIndicators performanceData={performanceData} pixelToMsRatio={PIXEL_TO_MS_RATIO} />}
                {requestData && requestData.map((requestDetails, i) => (
                  <RequestRow
                    requestDetails={requestDetails}
                    bgKlass={i % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                    mostLikelyLastTimestamp={mostLikelyLastTimestamp}
                    pixelToMsRatio={PIXEL_TO_MS_RATIO}
                    rowNum={i + 1}
                    isLCP={requestDetails.full_url === largestContentfulPaintImageUrl}
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

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