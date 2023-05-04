import { formattedMsOrSeconds } from '@/lib/utils';
import { useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import { XCircleIcon, StarIcon } from '@heroicons/react/24/outline';

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

export default function RequestVisual({ requestDetails, pixelToMsRatio, isLCP }) {
  const [isHovered, setIsHovered] = useState(false);
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const firstTimestamp = requestDetails.dns_start > -1 
                          ? requestDetails.dns_start
                          : requestDetails.connect_start > -1
                            ? requestDetails.connect_start
                            : requestDetails.ssl_start > -1
                              ? requestDetails.ssl_start
                              : requestDetails.ttfb_start > -1
                                ? requestDetails.ttfb_start
                                : requestDetails.download_start;

  return (
    <>
      <div>
        <div 
          className={`absolute top-0 h-[100%] z-50 ${isHovered ? 'scale-110' : ''}`}
          ref={setTriggerRef}
          onMouseOver={() => setIsHovered(true)}
          onMouseOut={() => setIsHovered(false)}
          style={{
            width: `${(requestDetails.download_end - firstTimestamp) * pixelToMsRatio}px`,
            marginLeft: `${firstTimestamp * pixelToMsRatio}px`,
          }}
        />
        {requestDetails.dns_start > -1 && (
          <div
            className='absolute h-[25%] bg-teal-600 top-[38%] z-20'
            style={{
              marginLeft: `${requestDetails.dns_start * pixelToMsRatio}px`,
              width: `${(requestDetails.dns_end - requestDetails.dns_start) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.connect_start > -1 && (
          <div
            className='absolute h-[25%] bg-orange-500 top-[38%] z-20'
            style={{
              marginLeft: `${requestDetails.connect_start * pixelToMsRatio}px`,
              width: `${(requestDetails.connect_end - requestDetails.connect_start) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.ssl_start > -1 && (
          <div
            className='absolute h-[25%] bg-pink-500 top-[38%] z-20'
            style={{
              marginLeft: `${requestDetails.ssl_start * pixelToMsRatio}px`,
              width: `${(requestDetails.ssl_end - requestDetails.ssl_start) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.ttfb_start > -1 && (
          <div
            className={`absolute h-[50%] top-[25%] z-20 ${REQUEST_COLORS_DICT[requestDetails.request_type]?.request || 'bg-blue-500'}`}
            style={{
              marginLeft: `${requestDetails.ttfb_start * pixelToMsRatio}px`,
              width: `${(requestDetails.ttfb_end - requestDetails.ttfb_start) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.download_start > -1 && (
          <>
            <div
              className={`absolute h-[50%] top-[25%] z-20 ${REQUEST_COLORS_DICT[requestDetails.request_type]?.response || 'bg-blue-700'}`}
              style={{
                marginLeft: `${requestDetails.download_start * pixelToMsRatio}px`,
                width: `${(requestDetails.download_end - requestDetails.download_start) * pixelToMsRatio}px`
              }}
            />
            <span
              className='absolute text-xs text-gray-700 h-[100%] flex items-center z-20 w-24 top-0'
              style={{ marginLeft: `${(requestDetails.download_end + 100) * pixelToMsRatio}px` }}
            >
              {formattedMsOrSeconds(requestDetails.all_ms)}
            </span>
          </>
        )}
      </div>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container min-w-52' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          <div className='bg-white p-2'>
            <div className='text-sm text-gray-700 font-medium mb-2'>
              {requestDetails.host}{requestDetails.url}
              {requestDetails.renderBlocking === 'blocking' && (
                <span className='text-red-600 text-sm block'>
                  <XCircleIcon className='h-4 w-4 text-red-600 mr-1 inline-block' />
                  Render blocking resource.
                </span>
              )}
              {isLCP && (
                <span className='text-green-600 text-sm block'>
                  <StarIcon className='h-4 w-4 bg-yellow-200 p-2 rounded text-gray-900 mr-1 inline-block' /> LCP Image
                </span>
              )}
            </div>
            {[
              ['DNS Time', 'dns_ms', 'bg-teal-600'],
              ['Connect Time', 'connect_ms', 'bg-orange-500'],
              ['SSL Time', 'ssl_ms', 'bg-pink-500'],
              ['Request Time', 'ttfb_ms', REQUEST_COLORS_DICT[requestDetails.request_type]?.request || 'bg-blue-500'],
              ['Response Time', 'download_ms', REQUEST_COLORS_DICT[requestDetails.request_type]?.response || 'bg-blue-700'],
            ].map(([label, key, color]) => (
              <div className='flex items-center' key={label}>
                <div className={`h-4 w-4 rounded mr-2 ${color} inline-block`} />
                <span className='text-sm text-gray-700'>
                  {label}: {formattedMsOrSeconds(requestDetails[key] > -1 ? requestDetails[key] : 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}