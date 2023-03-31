import { useState } from "react";
import { HeroImg } from '@components/HeroImg';
import CopiableCodeSnippet from "./CopiableCodeSnippet";

export default function NpmInstallInstructions({ projectId }) {
  return (
    <div className="grid grid-cols-2 mt-6">
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
                    <p className="text-sm text-gray-500 mb-2">Install the Swishjam NPM module in your terminal</p>
                    <CopiableCodeSnippet
                      snippet='npm install @swishjam/swishjam'
                      copyContent='npm install @swishjam/swishjam'
                      copyPos='relative'
                    />
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
                    <p className="text-sm text-gray-500 mb-2">
                      Import the Swishjam SDK into the client side of your web application.
                    </p>
                    <CopiableCodeSnippet
                      copyPos='relative'
                      copyContent={`import { Swishjam } from "@swishjam/swishjam";`}
                      snippet={
                        <div>
                          <span className='text-fuchsia-400 mr-1'>import</span>
                          <span className='mr-1'>{String.fromCharCode(123)}</span>
                          <span className='mr-1 text-sky-400'>Swishjam</span>
                          <span className='mr-1'>{String.fromCharCode(125)}</span>
                          <span className='text-fuchsia-400 mr-1'>from</span>
                          <span className='text-sky-400'>'@swishjam/swishjam'</span>
                          ;
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>

        </ul>
      </div>
      <div className="flow-root pb-32">
        <ul role="list" className="-mb-8">
          <li>
            <div className="relative pb-12">
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-swishjam flex items-center justify-center ring-8 text-white ring-white">
                    3
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Initialize the Swishjam API on the client side of each page of your web application.
                    </p>
                    <CopiableCodeSnippet
                      copyContent={`Swishjam.init({ publicApiKey: "${projectId}", reportingUrl: "https://api.swishjam.com/events" });`}
                      snippet={
                        <div>
                          <span className='block'>
                            <span className='text-sky-400'>Swishjam</span>
                            .
                            <span className='text-yellow-300'>init</span>
                            ({String.fromCharCode(123)}
                          </span>
                          <span className='block pl-4'>
                            <span className='text-sky-400'>publicApiKey</span>
                            :
                            <span className='text-green-400 ml-1'>"{projectId}"</span>
                            ,
                          </span>
                          <span className='block pl-4'>
                            <span className='text-sky-400'>reportingUrl</span>
                            :
                            <span className='text-green-400 ml-1'>"https://api.swishjam.com/events"</span>
                          </span>
                          <span className="block">{String.fromCharCode(125)})</span>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <HeroImg className="h-36 absolute right-0 bottom-0" />
      </div>
    </div>


  )
}
  /*<>
    <div className="h-full w-3/4 pr-12 mb-6" >
    </div>
    <div className="h-full w-1/4 mb-6 flex justify-end">
    </div>
  </>*/
