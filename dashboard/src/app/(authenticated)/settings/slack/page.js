'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import NewSlackEventTriggerModal from '@/components/SlackEventTriggers/NewModal'
import Dropdown from '@/components/utils/Dropdown'
import SwishjamAPI from '@/lib/api-client/swishjam-api'
import { getToken } from '@/lib/auth'
import { CursorArrowRaysIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

const InstallButton = () => {
  const authToken = getToken();
  const redirectHost = 'a135-2603-8000-7200-9d38-5901-44ce-189e-40d6.ngrok-free.app';
  const redirectUrl = `https://${redirectHost}/oauth/slack/callback`;
  const clientId = '3567839339057.6156356819525'
  const scopes = ['chat:write', 'chat:write.public', 'channels:read']
  return (
    <a href={`https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&=&redirect_uri=${redirectUrl}&client_id=${clientId}&state=${authToken}`}>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '12px' }} viewBox="0 0 122.8 122.8">
        <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"></path>
        <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"></path>
        <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"></path>
        <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"></path>
      </svg>
      Add to Slack
    </a>
  )
}

export default function SlackSettings() {
  const [hasSlackConnection, setHasSlackConnection] = useState(undefined);
  const [slackEventTriggers, setSlackEventTriggers] = useState(undefined);
  const [newModalIsOpen, setNewModalIsOpen] = useState(false);

  useEffect(() => {
    SwishjamAPI.SlackConnections.get().then(setHasSlackConnection)
    SwishjamAPI.EventTriggers.list({ type: 'EventTriggers::Slack' }).then(setSlackEventTriggers);
  }, [])

  if (typeof hasSlackConnection === 'undefined') {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 my-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Slack Notifications</h1>
          </div>
        </div>
        {typeof hasSlackConnection === 'undefined'
          ? <div className='w-full'><LoadingSpinner className='m-auto' /></div>
          : !hasSlackConnection && <InstallButton />
        }
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <NewSlackEventTriggerModal isOpen={newModalIsOpen} onClose={() => setNewModalIsOpen(false)} />
      <div className='grid grid-cols-2 my-8 flex items-center'>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Slack Notifications</h1>
        <div className='flex justify-end'>
          <button
            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
            onClick={() => setNewModalIsOpen(true)}
          >
            <PlusCircleIcon className='h-4 w-4 mr-1' />
            Add Slack Trigger
          </button>
        </div>
      </div>
      {!hasSlackConnection && <InstallButton />}
      <div className='flex items-center text-sm'>
        {typeof slackEventTriggers === 'undefined'
          ? <div className='w-full'><LoadingSpinner className='m-auto' /></div>
          : (
            slackEventTriggers.length === 0
              ? (
                <button
                  type="button"
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
                  onClick={() => setNewModalIsOpen(true)}
                >
                  <CursorArrowRaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-semibold text-gray-400">Add your first Slack trigger here.</span>
                </button>
              ) : (
                JSON.stringify(slackEventTriggers)
              )
          )
        }
      </div>
    </main>
  )
}