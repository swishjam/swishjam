'use client';
import { useState, useEffect } from 'react';
import { Card } from '@tremor/react';
import CopyToClipboard from "react-copy-to-clipboard";

export default function SnippetInstall() {
  const [copyTxt, setCopyTxt] = useState('Copy');
  const siteId = 'sj-syv3hiuj0p51nks5'
  const codeSnippet = `<script src="https://cdn.useswishjam.com/latest/src.js" swishjam-reporting-url="https://api.useswishjam.com/events" swishjam-public-api-key="${siteId}" swishjam-sample-rate="1.0" defer></script>` 

  return (
    <Card>
      <div className="flex">
        <div className="h-full w-1/2" >
          
          1. Copy the code on the right into you website's header. 
        </div>

        <div className="h-full w-1/2 flex flex-col justify-center items-center" >
          {/* copy to clipboard here */}
          <div
            className="relative bg-gray-50 border rounded-xl p-4 pr-12 break-all font-medium text-gray-900 text-sm"
          >
            {codeSnippet}
            <CopyToClipboard text={codeSnippet} className="absolute px-2.5 py-0.5 bottom-2 right-2 border rounded-lg bg-white inline-flex items-center gap-x-1.5 cursor-pointer hover:text-swishjam">
              <button onClick={() => {setCopyTxt('Copied!');setTimeout(() => setCopyTxt('Copy'), 2000)}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="-ml-0.5 w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                {copyTxt}
              </button>
            </CopyToClipboard>
          </div>
        </div>

     </div >
    </Card>
  )  

}