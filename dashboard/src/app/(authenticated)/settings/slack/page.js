'use client'

import Dropdown from '@/components/utils/Dropdown'

export default function SlackSettings() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Slack Notifications</h1>
        </div>
      </div>
      <div className='flex'>
        Trigger a slack notification upon the occurence of
        <div className='w-fit inline-block ml-1'>
          <Dropdown
            label={<span className='italic'>event</span>}
            options={['new_session', 'page_view', 'new_user']}
          />
        </div>
      </div>
    </main>
  )
}