'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLongRightIcon, CursorArrowRaysIcon, EllipsisVerticalIcon, ExclamationTriangleIcon, PauseCircleIcon, PlayCircleIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { getToken } from '@/lib/auth'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Menu, Transition } from '@headlessui/react'
import NewSlackEventTriggerModal from '@/components/SlackEventTriggers/NewModal'
import SwishjamAPI from '@/lib/api-client/swishjam-api'
import { RocketIcon } from "@radix-ui/react-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { XCircleIcon } from 'lucide-react'
import { swishjam } from '@swishjam/react'
import { useAuthData } from '@/hooks/useAuthData'

export default function SlackSettings() {
  const [hasSlackConnection, setHasSlackConnection] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [newModalIsOpen, setNewModalIsOpen] = useState(false);
  const [slackConnectionErrorMessage, setSlackConnectionErrorMessage] = useState(useSearchParams().get('error'))
  const [showConnectionSuccessMessage, setShowConnectionSuccessMessage] = useState(useSearchParams().get('success') === 'true');
  const [slackEventTriggers, setSlackEventTriggers] = useState(undefined);

  const authToken = getToken();
  const router = useRouter();
  const { workspaceId, workspaceName } = useAuthData();

  const disableTrigger = triggerId => {
    SwishjamAPI.EventTriggers.disable(triggerId).then(({ trigger, error }) => {
      if (error) {
        setErrorMessage(error);
      } else {
        setSlackEventTriggers([...slackEventTriggers.filter((t) => t.id !== trigger.id), trigger])
      }
    })
  }

  const enableTrigger = triggerId => {
    SwishjamAPI.EventTriggers.enable(triggerId).then(({ trigger, error }) => {
      if (error) {
        setErrorMessage(error);
      } else {
        setSlackEventTriggers([...slackEventTriggers.filter((t) => t.id !== trigger.id), trigger])
      }
    })
  }

  const deleteTrigger = triggerId => {
    SwishjamAPI.EventTriggers.delete(triggerId).then(({ error }) => {
      if (error) {
        setErrorMessage(error);
      } else {
        setSlackEventTriggers([...slackEventTriggers.filter((t) => t.id !== triggerId)])
      }
    })
  }

  useEffect(() => {
    SwishjamAPI.SlackConnections.get().then(slackConnection => {
      setHasSlackConnection(slackConnection !== null);
      if (slackConnection) {
        SwishjamAPI.EventTriggers.list().then(setSlackEventTriggers);
      }
    })
  }, [])


  if (typeof hasSlackConnection !== 'boolean') {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 my-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Slack Notifications</h1>
          </div>
        </div>
        <div className='w-full flex items-center justify-center p-8'>
          <LoadingSpinner className='m-auto' />
        </div>
      </main>
    )
  }

  if (hasSlackConnection === false) {
    const redirectHost = process.env.NEXT_PUBLIC_SLACK_REDIRECT_HOST || 'capture.swishjam.com';
    const redirectUrl = `https://${redirectHost}/oauth/slack/callback`;
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '3567839339057.6156356819525';
    const scopes = ['chat:write', 'chat:write.public', 'channels:read', 'groups:read'];
    const oauthLink = `https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&user_scope=groups:read&redirect_uri=${redirectUrl}&client_id=${clientId}&state=${authToken}`;
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 my-8 flex items-center'>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Slack Notifications</h1>
          <div className='flex justify-end'>
            <a
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
              href={oauthLink}
            >
              Connect Slack workspace
            </a>
            <button
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-gray-200 cursor-not-allowed"
              disabled={true}
            >
              <PlusCircleIcon className='h-4 w-4 mr-1' />
              Add Slack Trigger
            </button>
          </div>
        </div>
        {slackConnectionErrorMessage && (
          <Alert className='mb-2 border-red-400'>
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Slack connection error</AlertTitle>
            <div className='absolute top-0 right-0 p-2'>
              <XCircleIcon
                className='h-5 w-5 rounded-full cursor-pointer hover:bg-gray-200'
                onClick={() => {
                  setSlackConnectionErrorMessage(undefined)
                  router.push('/settings/slack')
                }}
              />
            </div>
            <AlertDescription>
              {slackConnectionErrorMessage}
            </AlertDescription>
          </Alert>
        )}
        <a
          href={oauthLink}
          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className='mx-auto h-20 w-20' viewBox="0 0 122.8 122.8">
            <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"></path>
            <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"></path>
            <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"></path>
            <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"></path>
          </svg>
          <h2 className="mt-4 block text-md font-semibold text-gray-400">Connect your Slack workspace</h2>
          <h4 className='block text-sm text-gray-400'>And begin sending notifications upon key Swishjam events.</h4>
        </a>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <NewSlackEventTriggerModal
        isOpen={newModalIsOpen}
        onClose={() => setNewModalIsOpen(false)}
        onNewTrigger={newTrigger => {
          swishjam.event('slack_trigger_created', {
            workspace_id: workspaceId,
            workspace_name: workspaceName,
            event_name: newTrigger.event_name,
            channel_name: newTrigger.steps?.[0]?.config?.channel_name
          })
          setSlackEventTriggers([...slackEventTriggers, newTrigger])
        }}
      />
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
      {showConnectionSuccessMessage && (
        <Alert className='mb-2'>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Slack is now connected!</AlertTitle>
          <div className='absolute top-0 right-0 p-2'>
            <XCircleIcon
              className='h-5 w-5 rounded-full cursor-pointer hover:bg-gray-200'
              onClick={() => {
                setShowConnectionSuccessMessage(false)
                router.push('/settings/slack')
              }}
            />
          </div>
          <AlertDescription>
            Now you can set up triggers of your Swishjam events into your Slack channels.
          </AlertDescription>
        </Alert>
      )}
      <div className='flex items-center text-sm'>
        {typeof slackEventTriggers === 'undefined'
          ? <div className='w-full flex items-center justify-center p-8'><LoadingSpinner className='m-auto' /></div>
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
                <ul role="list" className="w-full space-y-2">
                  {slackEventTriggers.map(slackTrigger => (
                    <li key={slackTrigger.id} className="bg-white relative flex items-center space-x-4 py-4 px-2 border border-gray-400 rounded">
                      <div className="min-w-0 flex-auto">
                        <div className="flex items-center gap-x-3">
                          <div className={`${slackTrigger.enabled ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'} flex-none rounded-full p-1`}>
                            <div className="h-2 w-2 rounded-full bg-current" />
                          </div>
                          <h2 className="min-w-0 text-sm font-semibold leading-6 text-gray-600">
                            <span className="truncate">{slackTrigger.event_name}</span>
                            <ArrowLongRightIcon className='h-4 w-4 inline-block mx-1' />
                            <span className="whitespace-nowrap">#{slackTrigger.steps[0].config.channel_name}</span>
                          </h2>
                        </div>
                        <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                          Created {new Date(slackTrigger.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger className='cursor-default'>
                            <div className='text-gray-600 flex items-center text-sm'>
                              {slackTrigger.trigger_count_last_7_days}
                              <CursorArrowRaysIcon className='h-5 w-5 inline-block ml-1' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className='text-xs text-gray-700'>
                            <p>This Slack notification has been triggered {slackTrigger.trigger_count_last_7_days} times in the last 7 days.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Menu as="div" className="relative inline-block text-left z-10">
                        <div>
                          <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                            <span className="sr-only">Open options</span>
                            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <>
                                    {slackTrigger.enabled ? (
                                      <div
                                        className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-orange-100 hover:text-orange-700'
                                        onClick={e => {
                                          e.preventDefault()
                                          disableTrigger(slackTrigger.id)
                                        }}
                                      >
                                        <PauseCircleIcon className='h-4 w-4 inline-block mr-2' /> Pause Slack trigger
                                      </div>
                                    ) : (
                                      <div
                                        className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-green-100 hover:text-green-700'
                                        onClick={e => {
                                          e.preventDefault()
                                          enableTrigger(slackTrigger.id)
                                        }}
                                      >
                                        <PlayCircleIcon className='h-4 w-4 inline-block mr-2' /> Resume Slack trigger
                                      </div>
                                    )}
                                    <div
                                      className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-red-100 hover:text-red-700'
                                      onClick={e => {
                                        e.preventDefault()
                                        deleteTrigger(slackTrigger.id)
                                      }}
                                    >
                                      <TrashIcon className='h-4 w-4 inline-block mr-2' /> Delete trigger
                                    </div>
                                  </>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </li>
                  ))}
                </ul>
              )
          )
        }
      </div>
    </main>
  )
}