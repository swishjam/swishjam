'use client';

import AuthenticatedView from "@/components/AuthenticatedView";
import { useEffect, useState } from "react";
import { WebPageTestResults } from "@/lib/web-page-test-results-parser";
import LifecycleVisualization from "@/components/LcpAnalyzer/LifecycleVisualization";
import GoodNeedsImprovementPoor from "@/components/LcpAnalyzer/GoodNeedsImprovementPoor";
import LCPImageViewer from "@/components/LcpAnalyzer/LCPImageViewer";
import { formattedMsOrSeconds } from "@/lib/utils";
import DetailsHeader from "@/components/LabTests/DetailsHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function WaterfallPage({ params }) {
  const { id } = params;
  const [webPageTestData, setWebPageTestData] = useState();

  useEffect(() => {
    fetch(`https://www.webpagetest.org/jsonResult.php?test=${id}&breakdown=${1}`)
      .then((res) => res.json())
      .then(async response => {
        if (response.statusCode === 200 && response.data?.median?.firstView?.requests) {
          setWebPageTestData(new WebPageTestResults(response));
        } else {
          // an error occurred!;
        }
      });
  }, [])

  const requestData = webPageTestData && webPageTestData.requestData();
  if (!webPageTestData) {
    return (
      <AuthenticatedView>
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <DetailsHeader labTestId={id} webPageTestResults={webPageTestData} selectedNavItem='LCP Breakdown' />
          <div className='flex flex-col items-center justify-center h-full'>
            <LoadingSpinner size={10} />
          </div>
        </main>
      </AuthenticatedView>
    );
  }
  const lcpImageURL = webPageTestData.lcpImg();
  if (!lcpImageURL) {
    return (
      <AuthenticatedView>
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <DetailsHeader labTestId={id} webPageTestResults={webPageTestData} selectedNavItem='LCP Breakdown' />
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-700 mb-2'>No LCP image found</div>
            <div className='text-md text-gray-500'>
              Currently the LCP breakdown only supports images as the LCP element, your LCP is a {webPageTestData.lcpType()} element.
            </div>
          </div>
        </main>
      </AuthenticatedView>
    )
  }
  const lcpValue = webPageTestData.lcpValue();
  const documentRequests = requestData.slice(0, 2).filter(request => request.requestType() === 'Document');
  const lcpImageURLRequest = requestData.find(req => req.url() === lcpImageURL);
  const lcpImageRequestNum = (lcpImageURLRequest || { payload: { number: -1 } }).payload.number;
  const numBlockingRequestsBeforeLCP = requestData.filter(req => req.payload.number < lcpImageRequestNum && req.isRenderBlocking()).length;
  const lcpImageDiscoveredAt = lcpImageURLRequest && lcpImageURLRequest.firstTimestamp();
  const lcpImageDownloadedAt = lcpImageURLRequest && lcpImageURLRequest.downloadEnd();
  const msFromDownloadToLCP = lcpValue - lcpImageDownloadedAt;
  const lcpImageFormat = lcpImageURLRequest && lcpImageURLRequest.payload.contentType;
  const ttfb = webPageTestData.performanceData().TimeToFirstByte;

  // const warnings = [
  //   lcpImageRequestNum > 10 && <span>The LCP image was the <span className='font-bold'>{numberWithOrdinalIndicator(lcpImageRequestNum)} request</span> for this page. Ideally the request comes as early as possible.</span>,
  //   numBlockingRequestsBeforeLCP > 7 && <span>There are <span className='font-bold'>{numBlockingRequestsBeforeLCP} blocking requests</span> before the LCP image request. Render blocking resources should be minimized, and are blocking your LCP image from being requested.</span>,
  //   lcpImageDiscoveredAt > 1_000 && <span>The LCP image was <span className='font-bold'>discovered by the browser at {formattedMsOrSeconds(lcpImageDiscoveredAt)}</span>, consider adding a <span className='bg-gray-100 text-gray-700 italic font-medium p-[2px]'>fetchpriority="high"</span> attribute to the image tag, or a <span className='bg-gray-100 text-gray-700 italic font-medium p-[2px]'>{'<'}link rel="preload"{'>'}</span> tag to the head so the browser can discover it earlier.</span>,
  //   msFromDownloadToLCP > 500 && <span>While LCP image was downloaded by the browser in {formattedMsOrSeconds(lcpImageDownloadedAt)}, it <span className='font-bold'>took an additional {formattedMsOrSeconds(msFromDownloadToLCP)}</span> to render it to the screen and trigger the LCP core web vital ({formattedMsOrSeconds(webPageTestData.lcpValue())}), meaning there are additional steps taken before the image is made visible after it was downloaded (likely some javascript that renders it). You should render the LCP image as soon as it is downloaded by the browser.</span>,
  //   lcpImageFormat !== 'image/webp' && <span>The LCP image is being served in the {lcpImageFormat}, consider changing this to the <span className='font-bold'>webp</span> format. Webp images are smaller and faster to download than other image formats.</span>,
  // ].filter(Boolean);

  return (
    <AuthenticatedView>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <DetailsHeader labTestId={id} webPageTestResults={webPageTestData} selectedNavItem='LCP Breakdown' />
        <div className='mt-4'>
          <div className='grid grid-cols-2 gap-8 items-center'>
            <div className='h-40'>
              <GoodNeedsImprovementPoor lcpValue={lcpValue} />
            </div>
            <LCPImageViewer webPageTestData={webPageTestData} />
            {/* <BreakdownExplanation ttfb={ttfb} lcpImageDiscoveredAt={lcpImageDiscoveredAt} lcpImageDownloadedAt={lcpImageDownloadedAt} lcpValue={lcpValue} /> */}
          </div>
          <div className='mt-8'>
            <LifecycleVisualization webPageTestData={webPageTestData} />
          </div>
          {/* <div className='mt-8'>
            <h2 className='text-lg text-gray-800'>Recommendations</h2>
          </div> */}
        </div>
      </main>
    </AuthenticatedView>
  )
}

const BreakdownExplanation = ({ ttfb, lcpImageDiscoveredAt, lcpImageDownloadedAt, lcpValue }) => {
  const explanations = [
    ['Time to first byte', ttfb, 'Measures the time from the start of the initial navigation until the browser receives the first byte of the response from the server. If your TTFB is high, then your LCP will also be high because the browser has to wait for the server to respond before it can start downloading the image. This is visualized with the blue area below.'],
    ['Resource load delay', lcpImageDiscoveredAt - ttfb, 'Measures the time between TTFB and when the browser first discovers the LCP image resource. This is visualized with the green area below.'],
    ['Resource load time', lcpImageDownloadedAt - lcpImageDiscoveredAt, 'Measures the time it takes to actually download the LCP image. This is visualized with the red area below.'],
    ['Element render delay', lcpValue - lcpImageDownloadedAt, 'Measures the time it takes from when the LCP image has been downloaded by the browser until it is fully rendered on the page. This is visualized with the yellow area below.']
  ]
  return (
    <div>
      <h4 className='text-lg text-gray-900'>Optimizing your Largest Contentful Paint can be challenging. In order to make simpler, we have broken down the LCP lifecycle into 4 parts:</h4>
      <div className=''>
        <ul role="list" className="space-y-4">
          {explanations.map(([title, value, description]) => <ExplanationItem key={title} lcpValue={lcpValue} title={title} value={value} description={description} />)}
        </ul>
      </div>
    </div>
  )
}

const ExplanationItem = ({ title, value, description, lcpValue }) => {
  const [descriptionIsExpanded, setDescriptionIsExpanded] = useState(false)
  return (
    <li className="relative flex gap-x-4">
      <div className='h-6 absolute left-0 top-0 flex w-6 justify-center'>
        <div className="w-px bg-gray-200" />
      </div>
      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 opacity-20 ring-1 ring-blue-800" />
      </div>
      <div className="flex-auto p-3">
        <div className="flex justify-between gap-x-4">
          <div className="py-0.5 text-sm leading-5 text-gray-500">
            <span 
              className="font-medium text-gray-900 hover:underline cursor-pointer"
              onClick={() => setDescriptionIsExpanded(!descriptionIsExpanded)}
            >
              {descriptionIsExpanded ? '-' : '+'} {title}
            </span>
          </div>
          <div className="flex-none py-0.5 text-sm leading-5 text-gray-500 font-medium">
            {parseFloat((value / lcpValue) * 100).toFixed(2)}% ({formattedMsOrSeconds(value)})
          </div>
        </div>
        {descriptionIsExpanded  && (
          <p className="text-sm leading-6 text-gray-500">
            {description}
          </p>
        )}
      </div>
    </li>
  )
}