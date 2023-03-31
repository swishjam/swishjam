import { useState } from "react";
import { HeroImg } from '@components/HeroImg';
import CopiableCodeSnippet from "./CopiableCodeSnippet";

export default function CdnInstallInstructions({ projectId }) {
  const [copyTxt, setCopyTxt] = useState('Copy');

  const cdnUrl = `https://cdn.swishjam.com/latest/src.js`
  const cdnApi = `https://api.swishjam.com/events`
  const codeSnippet = `<script src="${cdnUrl}" swishjam-reporting-url="${cdnApi}" swishjam-public-api-key="${projectId}" swishjam-sample-rate="1.0" defer></script>` 

  return (
    <div className="flex mt-6">
      <div className="h-full w-1/2 pr-12 mb-6" >
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
                      {/* <p className="text-xs text-gray-500 mt-1">*We keep our script tag really small and performant so it doesn't interfere with your site.</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div className="relative pb-12">
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
      <div className="h-full w-1/2 pb-32">
        <CopiableCodeSnippet
          copyContent={codeSnippet}
          snippet={codeSnippet}
        />
        <HeroImg className="h-36 pt-2 absolute bottom-0 right-0"/>
      </div>
    </div>
  )
}