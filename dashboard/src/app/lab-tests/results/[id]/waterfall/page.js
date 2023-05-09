'use client';

import AuthenticatedView from "@/components/AuthenticatedView";
import { useEffect, useState } from "react";
import Waterfall from "@/components/WebPageTest/waterfall/Waterfall";
import DetailsHeader from "@/components/LabTests/DetailsHeader";
import { WebPageTestResults } from "@/lib/web-page-test-results-parser";

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
  return (
    <AuthenticatedView>
      <DetailsHeader webPageTestResults={webPageTestData} selectedNavItem='Resource Waterfall' labTestId={id}/>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Waterfall 
          requestData={requestData} 
          performanceData={webPageTestData && webPageTestData.performanceData()} 
          largestContentfulPaintImageUrl={webPageTestData && webPageTestData.lcpImg()} 
          mostLikelyLastTimestamp={requestData && requestData[requestData.length - 1].downloadEnd()}
          pixelToMsRatio={(() => {
            const lastTimestamp = requestData && requestData[requestData.length - 1].downloadEnd()
            if (lastTimestamp) {
              return lastTimestamp < 3_000
                      ? 0.35
                      : lastTimestamp < 7_000
                        ? 0.2
                        : lastTimestamp < 10_000
                          ? 0.2
                          : lastTimestamp < 15_000
                            ? 0.1
                            : 0.05;
            }
          })()}
        />
      </main>
    </AuthenticatedView>
  )
}