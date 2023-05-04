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

  return (
    <AuthenticatedView>
      <DetailsHeader webPageTestResults={webPageTestData} selectedNavItem='Resource Waterfall' labTestId={id}
      />
      <Waterfall 
        requestData={webPageTestData && webPageTestData.requestData()} 
        performanceData={webPageTestData && webPageTestData.performanceData()} 
        largestContentfulPaintImageUrl={webPageTestData && webPageTestData.firstViewData.LargestContentfulPaintImageURL} 
      />
    </AuthenticatedView>
  )
}