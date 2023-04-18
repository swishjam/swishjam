'use client';

import { useEffect, useState, useRef } from 'react';
import LoadingFullScreen from '@/components/LoadingFullScreen';
import LoadingSpinner from '@/components/LoadingSpinner';
import Logo from '@/components/Logo';
import { WebPageTestResults } from '@/lib/web-page-test-results-parser';
import ResultsPage from '@/components/WebPageTest/ResultsPage';

const LOADING_MESSAGES = [
  'Crunching the numbers. This may take a few minutes.',
  'Amazon found that for every 100ms of page load latency, they lost 1% in sales.',
  'Walmart found that for every 1 second improvement in page load time, conversions increased by 2%.',
  'Google\'s research found that 53% of mobile site visits are abandoned if pages take longer than 3 seconds to load.',
];

export default function SpeedTest({ params }) {
  const { key } = params;
  const [isAwaitingResults, setIsAwaitingResults] = useState();
  const [webPageTestResults, setWebPageTestResults] = useState();
  const [auditedUrl, setAuditedUrl] = useState();

  const loadingMessageEl = useRef();
  const startedAgoEl = useRef();

  let currentLoadingMessageIndex = 0;

  const pollForResults = () => {
    fetch(`https://www.webpagetest.org/jsonResult.php?test=${key}&breakdown=${1}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          setWebPageTestResults(new WebPageTestResults(data));
          if (data.data.lighthouse.finalDisplayedUrl) setAuditedUrl(data.data.lighthouse.finalDisplayedUrl);
          setIsAwaitingResults(false);
        } else if(data.statusCode === 100) {
          if (!auditedUrl) setAuditedUrl(data.data.testInfo.url);
          setIsAwaitingResults(true);
          setTimeout(pollForResults, 5_000);
          setTimeout(() => {
            if (loadingMessageEl.current) {
              currentLoadingMessageIndex = currentLoadingMessageIndex === LOADING_MESSAGES.length - 1 ? 0 : currentLoadingMessageIndex + 1;
              loadingMessageEl.current.innerText = LOADING_MESSAGES[currentLoadingMessageIndex];
            }
            if (startedAgoEl.current) startedAgoEl.current.innerText = data.statusText;
          }, 3_000)
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
      {webPageTestResults || auditedUrl
        ? <ResultsPage webPageTestResults={webPageTestResults} auditedUrl={auditedUrl} />
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
                    <h2 className="text-2xl text-gray-900 mb-2">Running page speed audit</h2>
                    <h3 className="text-md font-light text-gray-600" ref={loadingMessageEl}>{LOADING_MESSAGES[0]}</h3>
                    <div className='m-auto my-4 w-fit'>
                      <LoadingSpinner size={8} />
                    </div>
                    <h3 className="text-md font-light text-gray-600" ref={startedAgoEl}></h3>
                  </div>
                </div>
              </div>
            )
        }
    </>
  );
}