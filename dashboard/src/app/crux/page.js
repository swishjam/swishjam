'use client'

import { useState } from 'react'
import AuthenticatedView from '@/components/AuthenticatedView'
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer'
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer'
import CruxData from '@/components/CruxData/CruxData'
import NewPageUrlModal from '@/components/ProjectPageUrls/NewModal'
import { ChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

export default function CruxDataPage() {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });

  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [urlForCruxData, setUrlForCruxData] = useState();
  const [displayNewPageUrlModal, setDisplayNewPageUrlModal] = useState(false);
  const [hasNoData, setHasNoData] = useState(false);

  return (
    <AuthenticatedView>
      {displayNewPageUrlModal && (
        <NewPageUrlModal
          title='Specify a URL for visualizing CrUX data and running lab tests.'
          subTitle='Once added, we will visualize CrUX data if available.'
          onClose={() => setDisplayNewPageUrlModal(false)} 
          isOpen={displayNewPageUrlModal} 
          onNewConfiguration={_newConfig => {}} 
          defaultLabTestCadence='never'
          successMessage='URL added successfully.'
        />
      )}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">
              Chrome Data
              <InformationCircleIcon className='h-4 w-4 inline-block ml-2' ref={setTriggerRef} />
              {visible && (
                <div
                  ref={setTooltipRef}
                  {...getTooltipProps({ className: 'tooltip-container max-w-[40vw]' })}
                >
                  <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                  <div className='text-sm p-4'>
                    <p className='text-gray-700'>This data is sourced from Google's Chrome Real User Experience report. If your site meets their threshold for the report, Swishjam pulls in the data here.</p>
                  </div>
                </div>
              )}
            </h1>
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