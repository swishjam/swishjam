'use client'

import { useState } from 'react'
import AuthenticatedView from '@/components/AuthenticatedView'
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer'
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer'
import CruxData from '@/components/CruxData/CruxData'

export default function CruxDataPage() {
  const [hasNoData, setHasNoData] = useState(false)
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [pathUrlToFilterOn, setPathUrlToFilterOn] = useState();
  const [urlForCruxData, setUrlForCruxData] = useState();

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">CrUX Data</h1>
          </div>
          <div className="w-full flex items-center justify-end">
            {!hasNoData && <HostUrlFilterer
              onNoHostsFound={() => setHasNoData(true)}
              urlHostAPI='lab'
              onHostSelected={hostUrl => {
                setPathUrlToFilterOn();
                setHostUrlToFilterOn(hostUrl)
              }}
            />}
            <div className='inline-block ml-2'>
              {!hasNoData && <PathUrlFilterer
                urlHost={hostUrlToFilterOn}
                urlPathAPI='lab'
                includeAllPathsSelection={false}
                onPathSelected={urlPath => {
                  setPathUrlToFilterOn(urlPath);
                  setUrlForCruxData(`https://${hostUrlToFilterOn}${urlPath}`)
                }}
              />}
            </div>
          </div>
        </div>
        <div className='my-8'>
          <CruxData url={urlForCruxData} shouldPromptUserToRegister={false} />
          {/* {urlForCruxData 
            ? <CruxData url={urlForCruxData} shouldPromptUserToRegister={false} />
            : 'Loading...'} */}
        </div>
      </main>
    </AuthenticatedView>
  )
}