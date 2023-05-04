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
        <>
          <div className='grid grid-cols-9 flex justify-baseline items-center max-w-3xl m-auto'>
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
        </>
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