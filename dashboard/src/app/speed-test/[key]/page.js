'use client';

import { useEffect, useState } from 'react';
import LoadingFullScreen from '@/components/LoadingFullScreen';
import LoadingSpinner from '@/components/LoadingSpinner';
import Logo from '@/components/Logo';
import { WebPageTestResults } from '@/lib/web-page-test-results-parser';
import WebPageTestResultsPage from '@/components/WebPageTest/ResultsPage';
import ResultsPage from '@/components/WebPageTest/ResultsPage';

export default function SpeedTest({ params }) {
  const { key } = params;
  const [isAwaitingResults, setIsAwaitingResults] = useState();
  const [webPageTestResults, setWebPageTestResults] = useState();

  const pollForResults = () => {
    fetch(`https://www.webpagetest.org/jsonResult.php?test=${key}&breakdown=${1}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        setWebPageTestResults(new WebPageTestResults(data));
        setIsAwaitingResults(false);
      } else if(data.statusCode === 100) {
        setIsAwaitingResults(true);
        setTimeout(pollForResults, 5_000);
      } else {
        // an error occurred!;
      }
    });
  }

  useEffect(() => {
    pollForResults();
  }, [])

  return (
    <>
      {webPageTestResults 
        ? <ResultsPage webPageTestResults={webPageTestResults} />
        : isAwaitingResults === undefined 
          ? <LoadingFullScreen /> 
          :  (
              <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                  <div className="mx-auto w-52">
                    <Logo className="h-12 inline-block" words={true} />
                  </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                  <div className="bg-white py-24 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm text-center">
                    <h2 className="text-2xl text-gray-900">Running page speed audit</h2>
                    <div className='m-auto w-fit mt-4'>
                      <LoadingSpinner size={8} />
                    </div>
                  </div>
                </div>
              </div>
            )
        }
    </>
  );
}