'use client';

import { useState, useEffect, Fragment } from 'react';
import { API } from '@/lib/api-client/base';
import Image from 'next/image';
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import { Menu, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { PlusCircleIcon, PauseCircleIcon, TrashIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import StripeImg from '@public/stripe-logo.jpeg'
import Modal from '@/components/utils/Modal';
import { useAuthData } from '@/lib/auth';

const CONNECTION_IMAGES = {
  Stripe: StripeImg,
}

const CONNECTION_OAUTH_URLS = {
  Stripe: authToken => `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_ONSwwqiCfDZHQzg1hURYH5pfTVj1PrAe&scope=read_write&redirect_uri=http://localhost:4242/oauth/stripe/callback&state={"authToken":"${authToken}"}`
}

const CONNECTION_DESCRIPTIONS = {
  Stripe: 'Connect your Stripe account to Swishjam to automatically import your Stripe customers and subscriptions.',
}

const AddConnectionButton = ({ connection, onConnectionClick }) => (
  <div 
    className="rounded-xl border border-gray-200 bg-white group cursor-pointer hover:bg-gray-50 duration-300 transition"
    onClick={onConnectionClick}
  >
    <div className="flex items-center gap-x-4 p-6">
      <Image
        src={CONNECTION_IMAGES[connection.name]}
        alt={connection.name}
        className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
      />
      <div className="text-sm font-medium leading-6 text-gray-900 group-hover:text-swishjam duration-300 transition">{connection.name}</div>
      <div className='relative ml-auto'>
        <PlusCircleIcon className='h-6 w-6 text-gray-900 group-hover:text-swishjam duration-300 transition' /> 
      </div> 
    </div>
  </div>
)

const ExistingConnectionItem = ({ connection, enabled, onRemoveClick, onDisableClick, onEnableClick }) => (
  <li key={connection.id} className={`rounded-xl border border-gray-200 ${enabled ? 'bg-white' : 'bg-gray-200'}`}>
    <div className="flex items-center gap-x-4 p-6">
      <Image
        src={CONNECTION_IMAGES[connection.name]}
        alt={connection.name}
        className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
      />
      <div className="text-sm font-medium leading-6 text-gray-900">
        {connection.name}
        {!enabled && (
          <span className="ml-2 inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 ring-1 ring-inset ring-orange-600/20">
            Disabled
          </span>
        )}
      </div>
      <Menu as="div" className="relative ml-auto">
        <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
          <span className="sr-only">Open options</span>
          <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            <Menu.Item>
              <>
                {enabled 
                  ? (
                    <a
                      href="#"
                      onClick={() => onDisableClick(connection.id)}
                      className='block px-3 py-2 text-sm leading-6 text-gray-900 flex items-center justify-around hover:bg-orange-50 hover:text-orange-500'
                    >
                      Disable<span className="sr-only">, {connection.name}</span>
                      <PauseCircleIcon className='h-6 w-6 inline-block' />
                    </a>
                  ) : (
                    <a
                      href="#"
                      onClick={() => onEnableClick(connection.id)}
                      className='block px-3 py-2 text-sm leading-6 text-gray-900 flex items-center justify-around hover:bg-green-50 hover:text-green-500'
                    >
                      Enable<span className="sr-only">, {connection.name}</span>
                      <PlayCircleIcon className='h-6 w-6 inline-block' />
                    </a>
                  )
                }
                <a
                  href="#"
                  onClick={() => onRemoveClick(connection.id)}
                  className='block px-3 py-2 text-sm leading-6 text-gray-900 flex items-center justify-around hover:bg-red-50 hover:text-red-500'
                >
                  Remove<span className="sr-only">, {connection.name}</span>
                  <TrashIcon className='h-6 w-6 inline-block' />
                </a>
              </>
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  </li>
)

const Connections = () => {
  const { authData } = useAuthData();
  const [enabledConnections, setEnabledConnections] = useState();
  const [disabledConnections, setDisabledConnections] = useState();
  const [availableConnections, setAvailableConnections] = useState();
  const [connectionForModal, setConnectionForModal] = useState(null);

  const disableConnection = async connectionId => {
    const result = await API.patch(`/api/v1/integrations/${connectionId}/disable`);
    if (result.success) {
      setEnabledConnections(enabledConnections.filter(connection => connection.id !== connectionId));
      setDisabledConnections([...disabledConnections, enabledConnections.find(connection => connection.id === connectionId)]);
    }
  }

  const enableConnection = async connectionId => {
    const result = await API.patch(`/api/v1/integrations/${connectionId}/enable`);
    if (result.success) {
      setDisabledConnections(disabledConnections.filter(connection => connection.id !== connectionId));
      setEnabledConnections([...enabledConnections, disabledConnections.find(connection => connection.id === connectionId)]);
    }
  }
  
  const removeConnection = async connectionId => {
    const result = await API.delete(`/api/v1/integrations/${connectionId}`);
    if (result.success) {
      setAvailableConnections([...availableConnections, enabledConnections.find(connection => connection.id === connectionId)]);
      setEnabledConnections(enabledConnections.filter(connection => connection.id !== connectionId));
      setDisabledConnections(disabledConnections.filter(connection => connection.id !== connectionId));
    }
  }

  useEffect(() => {
    const getConnections = async () => {
      const { enabled_integrations, disabled_integrations, available_integrations } = await API.get('/api/v1/integrations');
      setEnabledConnections(enabled_integrations);
      setDisabledConnections(disabled_integrations);
      setAvailableConnections(available_integrations);
    }
    getConnections();
  }, []);

  return (
    <>
      {enabledConnections === undefined 
        ? <LoadingView />
        : (
          <>
            {connectionForModal && (
              <Modal isOpen={true} onClose={() => setConnectionForModal(null)}>
                <div className='flex flex-col items-center justify-center'>
                  <Image
                    src={CONNECTION_IMAGES[connectionForModal.name]}
                    alt={connectionForModal.name}
                    className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                  />
                  <h1 className='text-2xl font-medium mb-4 mt-4'>Connect {connectionForModal.name}</h1>
                  <p className='text-gray-600 text-center mb-8'>{CONNECTION_DESCRIPTIONS[connectionForModal.name]}</p>
                  <a 
                    className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
                    href={CONNECTION_OAUTH_URLS[connectionForModal.name](authData.token())}
                  >
                    Connect {connectionForModal.name}
                  </a>
                </div>
              </Modal>
            )}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
              <div className='grid grid-cols-2 mt-8 flex items-center'>
                <div>
                  <h1 className="text-lg font-medium text-gray-700 mb-0">Connections</h1>
                </div>
                <div className="w-full flex items-center justify-end">
                </div>
              </div>
              <div className='pt-12'>
                <h5 className='py-2'>Connected Apps</h5>
                <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                  {enabledConnections.length + disabledConnections.length === 0
                    ? (
                      <div className='text-center my-4 text-md text-gray-600 col-span-3'>
                        You don't have any Swishjam connections yet install your first from the available connections below.
                      </div>
                    ) : (
                      enabledConnections.map(connection => (
                        <ExistingConnectionItem 
                          key={connection.id} 
                          connection={connection} 
                          onDisableClick={disableConnection}
                          onRemoveClick={removeConnection}
                          enabled={true}
                        />
                      ))
                    )
                  }
                  {disabledConnections.map(connection => (
                    <ExistingConnectionItem
                      key={connection.id}
                      connection={connection}
                      onRemoveClick={removeConnection}
                      onEnableClick={enableConnection}
                      enabled={false}
                    />
                  ))}
                </ul>

                <h5 className='pt-8 pb-2'>Available Connections</h5>
                <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                  {availableConnections.length === 0 
                    ? (
                      <div className='text-center my-4 text-md text-gray-600 col-span-3'>
                          You have installed all Swishjam connections! <br/> Looking for a connection that is not yet supported? Reach out to us <a className='underline' href='mailto:founders@swishjam.com'>founders@swishjam.com</a>.
                      </div>
                    ) : (
                      availableConnections.map((connection) => (
                        <AddConnectionButton 
                          key={connection.name} 
                          connection={connection} 
                          apiKey='INSTANCE-7da3a8bc' 
                          onConnectionClick={() => setConnectionForModal(connection)}
                        />
                      ))
                    )
                  }
                </ul>
              </div>
            </main>
          </>
        )}
    </>
  );
}

const LoadingView = () => (
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 mt-8 flex items-center'>
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Connections</h1>
      </div>
      <div className="w-full flex items-center justify-end">
      </div>
    </div>
    <div className='pt-12'>
      <h5 className='py-2'>Connected Apps</h5>
      <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="rounded-xl border border-gray-200 bg-gray-100 animate-pulse h-24" />
        ))}
      </ul>

      <h5 className='pt-8 pb-2'>Available Connections</h5>
      <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="rounded-xl border border-gray-200 bg-gray-100 animate-pulse h-24" />
        ))}
      </ul>
    </div>
  </main>
)

export default AuthenticatedView(Connections, LoadingView);