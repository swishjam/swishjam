'use client'

import Dropdown from '@/components/utils/Dropdown'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

export default function SlackSettings() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Slack Notifications</h1>
        </div>
      </div>
      <div className='flex items-center text-sm'>
        Trigger a slack notification upon the occurence of
        <div className='w-fit inline-block ml-1'>
          <Dropdown
            label={<span className='italic'>event</span>}
            options={['new_session', 'page_view', 'user_registered', 'invoice_approved']}
          />
        </div>
        <button className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam">
          <PlusCircleIcon className='h-4 w-4 mr-1' />
          Add Slack Trigger
        </button>
      </div>
    </main>
  )
}