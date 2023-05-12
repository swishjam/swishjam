import { useState } from "react";

export default function LcpImageViewer({ webPageTestData }) {
  if (!webPageTestData) return <div className='relative w-fit h-fit rounded bg-gray-200 animate-pulse' />;
  if (webPageTestData.isRunning()) return;

  const [lcpImageLoaded, setLCPImageLoaded] = useState(false);
  const [screenshotImageLoaded, setScreenshotImageLoaded] = useState(false);
  const viewportWidth = webPageTestData.firstViewData.viewport.width;
  const viewportHeight = webPageTestData.firstViewData.viewport.height;

  const borderTop = (webPageTestData.lcpBoundingRects().top / viewportHeight) * 100;
  const borderLeft = (webPageTestData.lcpBoundingRects().left / viewportWidth) * 100;
  const borderWidth = (webPageTestData.lcpBoundingRects().width / viewportWidth) * 100;
  const borderHeight = (webPageTestData.lcpBoundingRects().height / viewportHeight) * 100;
  return (
    <div 
      className={`relative w-full overflow-hidden rounded border m-auto border-gray-200 ${screenshotImageLoaded && lcpImageLoaded ? '' : 'bg-gray-200 animate-pulse'}`}
      style={{ aspectRatio: `${viewportWidth} / ${viewportHeight}` }}
    >
      <div 
        className='absolute hover:scale-110 transition z-10'
        style={{
          top: `${borderTop}%`,
          left: `${borderLeft}%`,
          width: `${borderWidth}%`,
          height: `${borderHeight}%`,
        }}
      >
        {screenshotImageLoaded && lcpImageLoaded && <div className='absolute text-xs text-white bg-black opacity-40 w-fit p-1 rounded'>LCP Image</div>}
        <img 
          src={webPageTestData.lcpImg()} 
          className={`w-full h-full ${screenshotImageLoaded && lcpImageLoaded ? '' : 'hidden'}`} 
          onLoad={() => setLCPImageLoaded(true) } 
        />
      </div>
      <img 
        src={webPageTestData.screenshotUrl()} 
        style={{ filter: 'blur(2px)' }} 
        className={screenshotImageLoaded && lcpImageLoaded ? '' : 'hidden'} 
        onLoad={() => setScreenshotImageLoaded(true) } 
      />
    </div>
  )
}