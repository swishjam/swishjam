'use client'

import { useState } from 'react'
import AuthenticatedView from '@/components/AuthenticatedView'
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer'
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer'
import CruxData from '@/components/CruxData/CruxData'
import NewPageUrlModal from '@/components/ProjectPageUrls/NewModal'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function CruxDataPage() {
  const [hasNoData, setHasNoData] = useState(true)
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [urlForCruxData, setUrlForCruxData] = useState();
  const [displayNewPageUrlModal, setDisplayNewPageUrlModal] = useState(false)

  return (
    <AuthenticatedView>
      {displayNewPageUrlModal && <NewPageUrlModal
                                    title='Specify a URL for visualizing CrUX data and running lab tests.'
                                    subTitle='Once added, we will visualize CrUX data if available.'
                                    onClose={() => setDisplayNewPageUrlModal(false)} 
                                    isOpen={displayNewPageUrlModal} 
                                    onNewConfiguration={_newConfig => {}} 
                                    defaultLabTestCadence='never'
                                    successMessage='URL added successfully.'
                                  />}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">CrUX Data</h1>
          </div>
          <div className="w-full flex items-center justify-end">
            {!hasNoData && <HostUrlFilterer
              onNoHostsFound={() => setHasNoData(true)}
              urlHostAPI='lab'
              onHostSelected={hostUrl => setHostUrlToFilterOn(hostUrl)}
            />}
            <div className='inline-block ml-2'>
              {!hasNoData && <PathUrlFilterer
                urlHost={hostUrlToFilterOn}
                urlPathAPI='lab'
                includeAllPathsSelection={false}
                onPathSelected={urlPath => setUrlForCruxData(`https://${hostUrlToFilterOn}${urlPath}`)}
              />}
            </div>
          </div>
        </div>
        <div className='my-8'>
          {hasNoData
            ? (
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setDisplayNewPageUrlModal(true)}
              >
                <ChartBarIcon className='mx-auto h-12 w-12 text-gray-700' />
                <span className="mt-2 block text-md font-semibold text-gray-700">You haven't configured any page URLs yet.</span>
                <span className="mt-2 block text-sm font-semibold text-gray-700">Add on here.</span>
              </button>
            ) : <CruxData url={urlForCruxData} shouldPromptUserToRegister={false} />}
        </div>
      </main>
    </AuthenticatedView>
  )
}