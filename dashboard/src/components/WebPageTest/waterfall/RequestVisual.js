import { formattedMsOrSeconds } from '@/lib/utils';
import { useState } from 'react';

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

  return (
    <>
      <div>
        <div 
          className={`absolute top-0 h-[100%] z-50 ${isHovered ? 'scale-110' : ''}`}
          style={{
            width: `${(requestDetails.downloadEnd() - requestDetails.firstTimestamp()) * pixelToMsRatio}px`,
            marginLeft: `${requestDetails.firstTimestamp() * pixelToMsRatio}px`,
          }}
        />
        {requestDetails.dnsStart() !== null && (
          <div
            className={`absolute h-[25%] bg-teal-600 top-[38%] z-20 ${isHovered ? 'scale-110' : ''}`}
            style={{
              marginLeft: `${requestDetails.dnsStart() * pixelToMsRatio}px`,
              width: `${(requestDetails.dnsTime()) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.waitStart() !== null && (
          <div
            className={`absolute h-[25%] bg-red-100 top-[38%] z-20 ${isHovered ? 'scale-110' : ''}`}
            style={{
              marginLeft: `${requestDetails.waitStart() * pixelToMsRatio}px`,
              width: `${(requestDetails.waitTime() || 0) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.connectStart() && (
          <div
            className={`absolute h-[25%] bg-orange-500 top-[38%] z-20 ${isHovered ? 'scale-110' : ''}`}
            style={{
              marginLeft: `${requestDetails.connectStart() * pixelToMsRatio}px`,
              width: `${(requestDetails.connectTime()) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.sslStart() && (
          <div
            className={`absolute h-[25%] bg-pink-500 top-[38%] z-20 ${isHovered ? 'scale-110' : ''}`}
            style={{
              marginLeft: `${requestDetails.sslStart() * pixelToMsRatio}px`,
              width: `${(requestDetails.sslTime()) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.ttfbStart() && (
          <div
            className={`absolute h-[50%] top-[25%] z-20 ${REQUEST_COLORS_DICT[requestDetails.requestType()]?.request || 'bg-blue-500'}`}
            style={{
              marginLeft: `${requestDetails.ttfbStart() * pixelToMsRatio}px`,
              width: `${(requestDetails.ttfbTime()) * pixelToMsRatio}px`
            }}
          />
        )}
        {requestDetails.downloadStart() && (
          <>
            <div
              className={`absolute h-[50%] top-[25%] z-20 ${REQUEST_COLORS_DICT[requestDetails.requestType()]?.response || 'bg-blue-700'}`}
              style={{
                marginLeft: `${requestDetails.downloadStart() * pixelToMsRatio}px`,
                width: `${requestDetails.downloadTime() * pixelToMsRatio}px`
              }}
            />
            <span
              className='absolute text-xs text-gray-700 h-[100%] flex items-center z-20 w-24 top-0'
              style={{ marginLeft: `calc(${requestDetails.downloadEnd() * pixelToMsRatio}px + 10px)` }}
            >
              {formattedMsOrSeconds(requestDetails.allMs())}
            </span>
          </>
        )}
      </div>
    </>
  )
}