import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { formattedMsOrSeconds, numberWithOrdinalIndicator } from "@/lib/utils";

export default function WarningMessage({ requestData, lcpImageURL, lcpValue }) {
  if (!lcpImageURL || !lcpValue) return;
  const lcpImageURLRequest = requestData.find(req => req.url() === lcpImageURL);
  const lcpImageRequestNum = (lcpImageURLRequest || { payload: { number: -1 }}).payload.number;
  const numBlockingRequestsBeforeLCP = requestData.filter(req => req.payload.number < lcpImageRequestNum && req.isRenderBlocking()).length;
  const lcpImageDiscoveredAt = lcpImageURLRequest && lcpImageURLRequest.firstTimestamp();
  const lcpImageDownloadedAt = lcpImageURLRequest && lcpImageURLRequest.downloadEnd();
  const msFromDownloadToLCP = lcpValue - lcpImageDownloadedAt;
  const lcpImageFormat = lcpImageURLRequest && lcpImageURLRequest.payload.contentType;

  const warnings = [
    lcpImageRequestNum > 10 && <span>The LCP image was the <span className='font-bold'>{numberWithOrdinalIndicator(lcpImageRequestNum)} request</span> for this page. Ideally the request comes as early as possible.</span>,
    numBlockingRequestsBeforeLCP > 7 && <span>There are <span className='font-bold'>{numBlockingRequestsBeforeLCP} blocking requests</span> before the LCP image request. Render blocking resources should be minimized, and are blocking your LCP image from being requested.</span>,
    lcpImageDiscoveredAt > 1_000 && <span>The LCP image was <span className='font-bold'>discovered by the browser at {formattedMsOrSeconds(lcpImageDiscoveredAt)}</span>, consider adding a <span className='bg-gray-100 text-gray-700 italic font-medium p-[2px]'>fetchpriority="high"</span> attribute to the image tag, or a <span className='bg-gray-100 text-gray-700 italic font-medium p-[2px]'>{'<'}link rel="preload"{'>'}</span> tag to the head so the browser can discover it earlier.</span>,
    msFromDownloadToLCP > 500 && <span>While LCP image was downloaded by the browser in {formattedMsOrSeconds(lcpImageDownloadedAt)}, it <span className='font-bold'>took an additional {formattedMsOrSeconds(msFromDownloadToLCP)}</span> to render it to the screen and trigger the LCP core web vital ({formattedMsOrSeconds(lcpValue)}), meaning there are additional steps taken before the image is made visible after it was downloaded (likely some javascript that renders it). You should render the LCP image as soon as it is downloaded by the browser.</span>,
    lcpImageFormat !== 'image/webp' && <span>The LCP image is being served in the {lcpImageFormat}, consider changing this to the <span className='font-bold'>webp</span> format. Webp images are smaller and faster to download than other image formats.</span>,
  ].filter(Boolean);

  return (
    warnings.length > 0 && (
      <div className="rounded-md bg-yellow-50 p-4 my-2">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-yellow-800">We noticed some issues with your Largest Contentful Paint:</h3>
            <ul className="mt-2 text-sm text-yellow-700 list-decimal">
              {warnings.map((warning, i) => (
                <li className='m-1' key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  )
}