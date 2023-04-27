'use client';

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView";
import { WebPageTestResults } from '@/lib/web-page-test-results-parser';
import LighthouseSection from "@/components/WebPageTest/LighthouseSection";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LighthouseDetails({ params }) {
  const { webPageTestId } = params;
  const [webPageTestResults, setWebPageTestResults] = useState();

  useEffect(() => {
    fetch(`https://www.webpagetest.org/jsonResult.php?test=${webPageTestId}&breakdown=${1}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          setWebPageTestResults(new WebPageTestResults(data));
        } else {
          // an error occurred!;
        }
      });
  }, [])

  return( 
    <AuthenticatedView>
      <div className='my-8'>
        {webPageTestResults 
          ? <LighthouseSection webPageTestResults={webPageTestResults} />
          : <div className='w-fit m-auto'><LoadingSpinner size={12} /></div>}
      </div>
    </AuthenticatedView>
  )
}