'use client';
import { useState, useEffect } from 'react';
import { Card } from '@tremor/react';
import CopyToClipboard from "react-copy-to-clipboard";
import { HeroImg } from '@components/HeroImg';

export default function SnippetInstall({ projectId }) {
  const [copyTxt, setCopyTxt] = useState('Copy');
  const codeSnippet = `<script src="https://cdn.useswishjam.com/latest/src.js" swishjam-reporting-url="https://api.useswishjam.com/events" swishjam-public-api-key="${projectId}" swishjam-sample-rate="1.0" defer></script>` 

  return (
    <Card>
      <div className="flex ">
        <div className="h-full w-1/2 pr-12 mb-6" >
          <h1 className="text-lg font-medium mb-2">Installation Instructions</h1>
          
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-swishjam flex items-center justify-center ring-8 ring-white text-white">
                        1
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">Copy & embed the snippet on the right into the <span className="font-medium text-gray-900">very bottom of the `head`</span> on each page of your website or application.</p>
                        <p className="text-xs text-gray-500 mt-1">*We keep our script tag really small and performant so it doesn't interfere with your site.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-swishjam flex items-center justify-center ring-8 text-white ring-white">
                        2
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">That's it! Once deployed load your site and then come back to Swishjam to see your data. Your data will load below and this section will disappear</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

            </ul>
          </div>

        </div>

        <div className="h-full w-1/2 mb-6">
          {/* copy to clipboard here */}
          <div
            className="relative bg-gray-50 !border rounded-xl p-4 pr-12 break-all font-medium text-gray-900 text-sm"
          >
            {codeSnippet}
            <CopyToClipboard text={codeSnippet} className="absolute px-2.5 py-0.5 bottom-2 right-2 !border rounded-lg bg-white inline-flex items-center gap-x-1.5 cursor-pointer hover:text-swishjam">
              <button onClick={() => {setCopyTxt('Copied!');setTimeout(() => setCopyTxt('Copy'), 2000)}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="-ml-0.5 w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                {copyTxt}
              </button>
            </CopyToClipboard>
          </div>

          <HeroImg className="absolute bottom h-36 bottom-0 right-0 pt-2"/>

        </div>

     </div >
    </Card>
  )  

}