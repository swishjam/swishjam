import { useState } from "react";
import { HeroImg } from '@components/HeroImg';
import CopiableCodeSnippet from "./CopiableCodeSnippet";

export default function CdnInstallInstructions({ projectId }) {
  const [copyTxt, setCopyTxt] = useState('Copy');

  const cdnUrl = `https://cdn.swishjam.com/latest/src.js`
  const cdnApi = `https://api.swishjam.com/events`
  const codeSnippet = `<script src="${cdnUrl}" swishjam-reporting-url="${cdnApi}" swishjam-public-api-key="${projectId}" swishjam-sample-rate="1.0" defer></script>` 

  // (function(projectKey) {
  //   var s = document.createElement('script');
  //   s.setAttribute('defer', '');
  //   s.setAttribute('src', 'https://cdn.swishjam.com/latest/src.js');
  //   document.head.appendChild(s);
  // })("my-project-key")

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
          copyContent={`
            (function(projectKey) { 
              var s = document.createElement('script'); 
              s.setAttribute('defer', ''); 
              s.setAttribute('src', "https://cdn.swishjam.com/" + projectKey + "/instrumentation.js");
              document.head.appendChild(s);
            })("${projectId}");`
          }
          snippet={
            <div>
              <span className='block'>
                {'<'}
                <span className='text-fuchsia-400'>script</span>
                {'>'}
              </span>
              <span className='ml-4 block'>
                (
                <span className='text-fuchsia-400'>function</span>
                (
                <span className='text-sky-400'>projectKey</span>
                <span className='mr-1'>) {'{'}</span>
              </span>
              <span className='block ml-8'>
                <span className='text-sky-500 mr-1'>var</span>
                <span className='text-sky-400 mr-1'>s</span>
                = 
                <span className='text-sky-400 ml-1'>document</span>
                .
                <span className='text-yellow-400'>createElement</span>
                (
                <span className='text-green-400'>'script'</span>
                );
              </span>
              <span className='block ml-8'>
                <span className='text-sky-400'>s</span>
                .
                <span className='text-yellow-400'>setAttribute</span>
                (
                <span className='text-green-400'>'defer'</span>
                , 
                <span className='text-green-400 ml-2'>''</span>
                );
              </span>
              <span className='block ml-8'>
                <span className='text-sky-400'>s</span>
                .
                <span className='text-yellow-400'>setAttribute</span>
                (
                <span className='text-green-400'>'src'</span>
                , 
                <span className='text-green-400 mr-1 ml-1'>'https://cdn.swishjam.com/'</span> 
                + 
                <span className='text-sky-400 mx-1'>projectKey</span>
                +
                <span className='text-green-400 ml-1'>'/instrumentation.js'</span>
                );
              </span>
              <span className='block ml-8'>
                <span className='text-sky-400'>document</span>
                .
                <span className='text-sky-500'>head</span>
                .
                <span className='text-yellow-400'>appendChild</span>
                (
                <span className='text-sky-400'>s</span>
                );
              </span>
              <span className='block ml-4'>
                {'}'}(
                  <span className='text-green-400'>'{projectId}'</span>
                )
              </span>
              <span className='block'>
                {'</'}
                <span className='text-fuchsia-400'>script</span>
                {'>'}
              </span>
            </div>
          }
        />
        <HeroImg className="h-36 pt-2 absolute bottom-0 right-0"/>
      </div>
    </div>
  )
}