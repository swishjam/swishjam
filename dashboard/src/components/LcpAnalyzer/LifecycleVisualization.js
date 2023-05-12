import { useState } from "react";
import Modal from "../utils/Modal";
import { usePopperTooltip } from "react-popper-tooltip";
import 'react-popper-tooltip/dist/styles.css';
import { formattedMsOrSeconds } from "@/lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const MODAL_CONTENT = {
  'time-to-first-byte': (
    <>
      <h2 className='text-lg text-gray-800 font-medium mb-2'>Time to First Byte</h2>
      <span className='text-md text-gray-700'>The time it takes for the browser to receive the first byte of content from the document request. TTFB is important because it impacts every metric to follow, if you have a slow TTFB, it will lead to a slow LCP. You should aim for this to take up 40% of your LCP time.</span>
    </>
  ),
  'resource-load-delay': (
    <>
      <h2 className='text-lg text-gray-800 font-medium mb-2'>Resource Load Delay</h2>
      <span className='text-md text-gray-700'>The time between TTFB and when the browser first discovers the LCP image resource. In order to have a good LCP, the browser should discover the LCP resource as early as possible. You should aim for this to take up 10% of your LCP time.</span>
    </>
  ),
  'resource-load-time': (
    <>
      <h2 className='text-lg text-gray-800 font-medium mb-2'>Resource laod time</h2>
      <span className='text-md text-gray-700'>The time it takes to actually download the LCP image once the browser discovers it. You should aim for this to take up 40% of your LCP time.</span>
    </>
  ),
  'element-render-delay': (
    <>
      <h2 className='text-lg text-gray-800 font-medium mb-2'>Element Render Delay</h2>
      <span className='text-md text-gray-700'>The time it takes from when the LCP image has been downloaded by the browser until it is fully rendered on the page. You should try to display the image as soon as possible once it has been downloaded. You should aim for this to take up 10% of your LCP time.</span>
    </>
  ),
}

export default function LifecycleVisualization({ webPageTestData }) {
  const [hoveredSubPart, setHoveredSubPart] = useState(null);
  const [modalContent, setModalContent] = useState(null);

  const requestData = webPageTestData.requestData();
  const lcpImageURL = webPageTestData.lcpImg();
  const lcpValue = webPageTestData.lcpValue();
  const documentRequest = requestData.slice(0, 2).find(request => request.requestType() === 'Document');
  const lcpImageURLRequest = requestData.find(req => req.url() === lcpImageURL);
  const lcpImageRequestNum = (lcpImageURLRequest || { payload: { number: -1 } }).payload.number;
  // const numBlockingRequestsBeforeLCP = requestData.filter(req => req.payload.number < lcpImageRequestNum && req.isRenderBlocking()).length;
  const lcpImageDiscoveredAt = lcpImageURLRequest && lcpImageURLRequest.firstTimestamp();
  const lcpImageDownloadedAt = lcpImageURLRequest && lcpImageURLRequest.downloadEnd();
  // const msFromDownloadToLCP = lcpValue - lcpImageDownloadedAt;
  // const lcpImageFormat = lcpImageURLRequest && lcpImageURLRequest.payload.contentType;
  const ttfb = webPageTestData.performanceData().TimeToFirstByte;

  return (
    <>
      <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} content={modalContent}/>
      {/* <h2 className='text-lg text-gray-800'>Largest Contentful Paint is broken down into 4 stages:</h2> */}
      <dl className="my-5 grid grid-cols-4 gap-4">
        <LCPSubPartStat 
          title='1. Time to First Byte'
          value={ttfb} 
          lcpValue={lcpValue} 
          color='blue'
          idealPercentage={40}
          onHover={() => setHoveredSubPart('time-to-first-byte')}
          onMouseOut={() => setHoveredSubPart()}
          isHovered={hoveredSubPart === 'time-to-first-byte'}
          onInfoClick={() => setModalContent(MODAL_CONTENT['time-to-first-byte'])}
        />
        <LCPSubPartStat 
          title='2. Resource load delay' 
          value={lcpImageDiscoveredAt - ttfb} 
          lcpValue={lcpValue} 
          color='green'
          idealPercentage={10}
          onHover={() => setHoveredSubPart('resource-load-delay')}
          onMouseOut={() => setHoveredSubPart()}
          isHovered={hoveredSubPart === 'resource-load-delay'}
          onInfoClick={() => setModalContent(MODAL_CONTENT['resource-load-delay'])}
        />
        <LCPSubPartStat 
          title='3. Resource load time' 
          value={lcpImageDownloadedAt - lcpImageDiscoveredAt} 
          lcpValue={lcpValue} 
          color='red'
          idealPercentage={40}
          onHover={() => setHoveredSubPart('resource-load-time')}
          onMouseOut={() => setHoveredSubPart()}
          isHovered={hoveredSubPart === 'resource-load-time'}
          onInfoClick={() => setModalContent(MODAL_CONTENT['resource-load-time'])}
        />
        <LCPSubPartStat 
          title='4. Element render delay' 
          value={lcpValue - lcpImageDownloadedAt} 
          lcpValue={lcpValue} 
          color='yellow'
          idealPercentage={10}
          onHover={() => setHoveredSubPart('element-render-delay')}
          onMouseOut={() => setHoveredSubPart()}
          isHovered={hoveredSubPart === 'element-render-delay'}
          onInfoClick={() => setModalContent(MODAL_CONTENT['element-render-delay'])}
        />
      </dl>
      <div className='border border-gray-200 rounded-md p-4'>
        <div className='grid grid-cols-10'>
          <div className='col-span-2'>
            <div className='h-5' />
            <div className={`cursor-default h-10 px-1 py-2 bg-gray-50`}>
              <span className='text-sm text-gray-500 mr-2'>{documentRequest.payload.number}.</span>
              <span className='text-sm text-gray-900'>{documentRequest.friendlyURL()}</span>
            </div>
            <div className={`cursor-default h-10 px-1 py-2 bg-white`}>
              <span className='text-sm text-gray-500 mr-2'>...{lcpImageRequestNum - documentRequest.payload.number} requests...</span>
            </div>
            <div className={`h-10 relative px-1 py-2 bg-gray-50`}>
              <div className='cursor-default whitespace-nowrap overflow-hidden hover:absolute hover:bg-white hover:top-2 hover:left-1 hover:w-fit'>
                <span className='text-sm text-gray-500 mr-2'>{lcpImageRequestNum}.</span>
                <span className='text-sm text-gray-900'>{lcpImageURLRequest.friendlyURL()}</span>
              </div>
            </div>
          </div>
          <div className='col-span-8 relative overflow-x-scroll'>
            <div className='w-full'>
              <PercentageMarkers
                ttfb={ttfb}
                lcpImageDiscoveredAt={lcpImageDiscoveredAt}
                lcpImageDownloadedAt={lcpImageDownloadedAt}
                lcpValue={lcpValue}
              />
              <div className='relative'>
                <LCPSubPartOverlay
                  metric='Time to First Byte'
                  value={ttfb}
                  marginLeft={0}
                  bgColor='blue'
                  lcpValue={lcpValue}
                  onHover={() => setHoveredSubPart('time-to-first-byte')}
                  onMouseOut={() => setHoveredSubPart()}
                  isHovered={hoveredSubPart === 'time-to-first-byte'}
                />
                <LCPSubPartOverlay
                  metric='Resource Load Delay'
                  value={lcpImageDiscoveredAt - ttfb}
                  marginLeft={ttfb}
                  bgColor='green'
                  lcpValue={lcpValue}
                  onHover={() => setHoveredSubPart('resource-load-delay')}
                  onMouseOut={() => setHoveredSubPart()}
                  isHovered={hoveredSubPart === 'resource-load-delay'}
                />
                <LCPSubPartOverlay
                  metric='Resource Load Time'
                  value={lcpImageDownloadedAt - lcpImageDiscoveredAt}
                  marginLeft={lcpImageDiscoveredAt}
                  bgColor='red'
                  lcpValue={lcpValue}
                  onHover={() => setHoveredSubPart('resource-load-time')}
                  onMouseOut={() => setHoveredSubPart()}
                  isHovered={hoveredSubPart === 'resource-load-time'}
                />
                <LCPSubPartOverlay
                  metric='Element Render Delay'
                  value={lcpValue - lcpImageDownloadedAt}
                  marginLeft={lcpImageDownloadedAt}
                  bgColor='yellow'
                  lcpValue={lcpValue}
                  onHover={() => setHoveredSubPart('element-render-delay')}
                  onMouseOut={() => setHoveredSubPart()}
                  isHovered={hoveredSubPart === 'element-render-delay'}
                />
                <div
                  className='h-full absolute z-50'
                  style={{
                    right: 0,
                    width: 0,
                    borderRight: '2px dotted black'
                  }}
                />
                <div key={documentRequest.number} className={`h-10 relative w-full bg-white`}>
                  <div
                    className='absolute h-[50%] top-[25%] bg-blue-500 rounded'
                    style={{
                      marginLeft: `${documentRequest.firstTimestamp() / lcpValue * 100}%`,
                      width: `${documentRequest.allMs() / lcpValue * 100}%`,
                    }}
                  />
                </div>
                <div className={`h-10 relative w-full text-sm text-gray-700 bg-gray-50`}>
                  <div
                    className='absolute h-[50%] top-[25%] bg-gray-200 rounded'
                    style={{
                      marginLeft: `${documentRequest.firstTimestamp() / lcpValue * 100}%`,
                      width: `${requestData[lcpImageURLRequest.payload.index - 1].allMs() / lcpValue * 100}%`
                    }}
                  />
                </div>
                <div className={`h-10 relative w-full bg-gray-50`}>
                  <div
                    className='absolute h-[50%] top-[25%] bg-yellow-500 rounded'
                    style={{
                      marginLeft: `${lcpImageDiscoveredAt / lcpValue * 100}%`,
                      width: `${(lcpImageDownloadedAt - lcpImageDiscoveredAt) / lcpValue * 100}%`
                    }}
                  />
                </div>
              </div>
              <PercentageMarkers
                ttfb={ttfb}
                lcpImageDiscoveredAt={lcpImageDiscoveredAt}
                lcpImageDownloadedAt={lcpImageDownloadedAt}
                lcpValue={lcpValue}
                asTime={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const LCPSubPartStat = ({ title, value, idealPercentage, lcpValue, onHover, onMouseOut, isHovered, onInfoClick }) => {
  const { visible, getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef } = usePopperTooltip();

  const percentOfLCP = value / lcpValue * 100;
  const percentAwayFromIdealPercent = idealPercentage - (value / lcpValue * 100);
  return (
    <div 
      className={`px-4 py-5 rounded-md border transition ${isHovered ? 'shadow-lg border-gray-400' : 'border-gray-200'}`}
      onMouseOver={onHover} 
      onMouseOut={onMouseOut}
    >
      <div className='flex items-center justify-between'>
        <dt className={`text-base font-normal text-greyy-500`}>{title}</dt>
        <InformationCircleIcon className='h-4 w-4 cursor-pointer rounded-full hover:text-gray-900 hover:bg-gray-200' onClick={onInfoClick} />
      </div>
      <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
        <div className="flex items-baseline text-2xl font-semibold text-gray-700">
          {parseFloat(value / lcpValue * 100).toFixed(2)}% 
          <span className='text-sm font-normal text-gray-500 ml-2'>({formattedMsOrSeconds(value)})</span>
        </div>
      </dd>
      <div className='mt-2 flex items-center' ref={setTriggerRef}>
        <div className='inline-block rounded-tl-md rounded-bl-md h-4 ml-[10%] bg-gray-200 relative' style={{ width: 'calc(40% - 0.5rem)' }}>
          {percentOfLCP < idealPercentage && (
            <div
              className={`h-full rounded-tl-md rounded-bl-md absolute right-0 transition ${isHovered ? 'scale-105' : ''} ${Math.abs(percentAwayFromIdealPercent) <= 5 ? 'bg-green-500 hover:bg-green-600' : Math.abs(percentAwayFromIdealPercent) <= 10 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}
              style={{ width: `${Math.abs(percentAwayFromIdealPercent * 2)}%` }}
            />
          )}
        </div>
        <div className='h-6 rounded w-2 bg-gray-400 border border-white text-xs text-gray-400 relative' />
        <div className='inline-block rounded-tr-md rounded-br-md h-4 bg-gray-200 relative' style={{ width: 'calc(40% - 0.5rem)' }}>
          {percentOfLCP > idealPercentage && (
            <div
              className={`h-full rounded-tr-md rounded-br-md transition ${isHovered ? 'scale-105' : ''} ${Math.abs(percentAwayFromIdealPercent) <= 5 ? 'bg-green-500 hover:bg-green-600' : Math.abs(percentAwayFromIdealPercent) <= 10 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}
              style={{ width: `${Math.abs(percentAwayFromIdealPercent * 2)}%` }}
            />
          )}
        </div>
      </div>
      <div className='flex items-cente text-xs text-gray-400'>
        <div className='inline-block ml-[10%] relative' style={{ width: 'calc(40% - 0.5rem)' }}>
          {percentOfLCP < idealPercentage && (
            <div className={`absolute right-0`} style={{ width: `${Math.abs(percentAwayFromIdealPercent * 2)}%` }}>
              {parseFloat(percentOfLCP).toFixed(2)}%
            </div>
          )}
        </div>
        <div className='h-6 w-2'></div>
        <div className='inline-block relative' style={{ width: 'calc(40% - 0.5rem)' }}>
          {percentOfLCP > idealPercentage && (
            <div className='text-right' style={{ width: `${Math.abs(percentAwayFromIdealPercent * 2)}%` }}>
              {parseFloat(percentOfLCP).toFixed(2)}%
            </div>
          )}
        </div>
      </div>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow', 'data-popper-arrow': true })} />
          <div className='text-xs text-gray-500'>
            Your {title.replace(/[^a-zA-Z\s]/g, '').trimStart()} makes up for {parseFloat(percentOfLCP).toFixed(2)}% of your LCP time. You should aim to have this be around {idealPercentage}%.
          </div>
        </div>
      )}
    </div>
  )
}

const PercentageMarkers = ({ ttfb, lcpImageDiscoveredAt, lcpImageDownloadedAt, lcpValue, asTime = false }) => {
  return (
    <div className='h-5 flex'>
      <div
        className='whitespace-nowrap border-r border-gray-200 h-full inline-block text-xs text-gray-700 text-right px-1'
        style={{ width: `${ttfb / lcpValue * 100}%` }}
      >
        {asTime ? formattedMsOrSeconds(ttfb) : `${parseFloat(ttfb / lcpValue * 100).toFixed(2)}%`}
      </div>
      <div
        className='whitespace-nowrap border-r border-gray-200 h-full inline-block text-xs text-gray-700 text-right px-1'
        style={{ width: `${(lcpImageDiscoveredAt - ttfb) / lcpValue * 100}%` }}
      >
        {asTime ? formattedMsOrSeconds(lcpImageDiscoveredAt) : `${parseFloat((lcpImageDiscoveredAt - ttfb) / lcpValue * 100).toFixed(2)}%`}
      </div>
      <div
        className='whitespace-nowrap border-r border-gray-200 h-full inline-block text-xs text-gray-700 text-right px-1'
        style={{ width: `${(lcpImageDownloadedAt - lcpImageDiscoveredAt) / lcpValue * 100}%` }}
      >
        {asTime ? formattedMsOrSeconds(lcpImageDownloadedAt) : `${parseFloat((lcpImageDownloadedAt - lcpImageDiscoveredAt) / lcpValue * 100).toFixed(2)}%`}
      </div>
      <div
        className='whitespace-nowrap border-r border-gray-200 h-full inline-block text-xs text-gray-700 text-right px-1'
        style={{ width: `${(lcpValue - lcpImageDownloadedAt) / lcpValue * 100}%` }}
      >
        {asTime ? formattedMsOrSeconds(lcpValue) : `${parseFloat((lcpValue - lcpImageDownloadedAt) / lcpValue * 100).toFixed(2)}%`}
      </div>
    </div>
  )
}

const LCPSubPartOverlay = ({ value, bgColor, marginLeft, lcpValue, isHovered, onHover, onMouseOut }) => {
  return (
    <div
      className={`absolute h-full z-20 transition duration-200 ${isHovered ? 'scale-y-110 opacity-30' : 'opacity-20'}`}
      onMouseOver={onHover}
      onMouseOut={onMouseOut}
      style={{
        width: `${value / lcpValue * 100}%`,
        background: bgColor,
        left: `${marginLeft / lcpValue * 100}%`,
      }}
    />
  )
}