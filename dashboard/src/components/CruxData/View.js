'use client'

import { useState } from 'react'
import CruxData from '@/components/CruxData/CruxData'
import NewPageUrlModal from '@/components/ProjectPageUrls/NewModal'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import 'react-popper-tooltip/dist/styles.css';

export default function CruxDataView({ url, hasNoData }) {
  const [displayNewPageUrlModal, setDisplayNewPageUrlModal] = useState(false);

  return (
    <>
      {displayNewPageUrlModal && (
        <NewPageUrlModal
          title='Specify a URL for visualizing CrUX data and running lab tests.'
          subTitle='Once added, we will visualize CrUX data if available.'
          onClose={() => setDisplayNewPageUrlModal(false)}
          isOpen={displayNewPageUrlModal}
          onNewConfiguration={_newConfig => { }}
          defaultLabTestCadence='never'
          successMessage='URL added successfully.'
        />
      )}
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
          ) : <CruxData url={url} shouldPromptUserToRegister={false} />}
      </div>
    </>
  )
}