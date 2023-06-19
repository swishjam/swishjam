'use client';

import { useEffect, useState } from "react";
import { WebPageTestResults } from "@/lib/web-page-test/web-page-test-results-parser";
import FilmstripVideo from "@/components/WebPageTest/FilmstripVideo";

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
    <div className='w-screen h-screen'>
      <div className='flex items-center justify-center'>
        <FilmstripVideo 
          filmstrip={webPageTestData?.filmstrip()} 
          performanceMetrics={{
            LargestContentfulPaint: webPageTestData?.performanceData().LargestContentfulPaint,
            FirstContentfulPaint: webPageTestData?.performanceData().firstContentfulPaint,
            TimeToFirstByte: webPageTestData?.performanceData().TimeToFirstByte,
          }} 
        />
      </div>
    </div>
  )
}