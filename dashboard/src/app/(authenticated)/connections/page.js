'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuthData } from '@/hooks/useAuthData';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api';
import LoadingView from './LoadingView';
import EmptyView from './EmptyView';
import Image from 'next/image';
import Modal from '@/components/utils/Modal';
import AddConnectionButton from './AddConnectionButton';
import ExistingConnectionButton from './ExistingConnectionButton';
import { RxCardStack } from 'react-icons/rx';

import StripeImg from '@public/stripe-logo.jpeg'

const ALL_CONNECTIONS = {
  Stripe: {
    img: StripeImg,
    description: 'Connect your Stripe account to Swishjam to automatically import your Stripe customers and subscriptions.',
    oauthUrl: authToken => `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_ONSwwqiCfDZHQzg1hURYH5pfTVj1PrAe&scope=read_write&redirect_uri=http://localhost:4242/oauth/stripe/callback&state={"authToken":"${authToken}"}`,
  }
}

export default function Connections() {
  const { token } = useAuthData();
  const [enabledConnections, setEnabledConnections] = useState();
  const [disabledConnections, setDisabledConnections] = useState();
  const [availableConnections, setAvailableConnections] = useState();
  const [connectionForModal, setConnectionForModal] = useState(null);

  const disableConnection = async connectionId => {
    const result = await SwishjamAPI.Integrations.disable(connectionId);
    if (result.success) {
      setEnabledConnections(enabledConnections.filter(connection => connection.id !== connectionId));
      setDisabledConnections([...disabledConnections, enabledConnections.find(connection => connection.id === connectionId)]);
    }
  }

  const enableConnection = async connectionId => {
    const result = await SwishjamAPI.Integrations.enable(connectionId);
    if (result.success) {
      setDisabledConnections(disabledConnections.filter(connection => connection.id !== connectionId));
      setEnabledConnections([...enabledConnections, disabledConnections.find(connection => connection.id === connectionId)]);
    }
  }

  const removeConnection = async connectionId => {
    const result = await SwishjamAPI.Integrations.delete(connectionId);
    if (result.success) {
      setAvailableConnections([...availableConnections, enabledConnections.find(connection => connection.id === connectionId)]);
      setEnabledConnections(enabledConnections.filter(connection => connection.id !== connectionId));
      setDisabledConnections(disabledConnections.filter(connection => connection.id !== connectionId));
    }
  }

  useEffect(() => {
    const getConnections = async () => {
      const { enabled_integrations, disabled_integrations, available_integrations } = await SwishjamAPI.Integrations.list();
      setEnabledConnections(enabled_integrations);
      setDisabledConnections(disabled_integrations);
      setAvailableConnections(available_integrations);
    }
    getConnections();
  }, []);

  return (
    enabledConnections === undefined
      ? <LoadingView />
      : (
        <>
          {connectionForModal && (
            <Modal isOpen={true} onClose={() => setConnectionForModal(null)}>
              <div className='flex flex-col items-center justify-center'>
                <Image
                  src={ALL_CONNECTIONS[connectionForModal.name].img}
                  alt={connectionForModal.name}
                  className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                />
                <h1 className='text-2xl font-medium mb-4 mt-4'>Connect {connectionForModal.name}</h1>
                <p className='text-gray-600 text-center mb-8'>{ALL_CONNECTIONS[connectionForModal.name].description}</p>
                <a
                  className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
                  href={ALL_CONNECTIONS[connectionForModal.name].oauthUrl(token)}
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
              {enabledConnections.length + disabledConnections.length === 0 &&
                <EmptyView
                  allConnections={ALL_CONNECTIONS} 
                  availableConnections={availableConnections}
                  setConnectionForModal={setConnectionForModal} 
                />}
              {enabledConnections.length + disabledConnections.length > 0 &&
                <>
                  <h5 className='py-2'>Connected Apps</h5>
                  <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                    {enabledConnections.map(connection => (
                      <ExistingConnectionButton
                        key={connection.id}
                        img={ALL_CONNECTIONS[connection.name].img} 
                        connection={connection}
                        onDisableClick={disableConnection}
                        onRemoveClick={removeConnection}
                        enabled={true}
                      />
                    ))}
                  </ul>
                  <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                    {disabledConnections.map(connection => (
                      <ExistingConnectionButton
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
                      <div className="text-center col-span-3 my-8">
                        <RxCardStack className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">You have installed all Swishjam connections!</h3>
                        <p className="mt-1 text-sm text-gray-500">Looking for a connection that is not yet supported? <br />Reach out to us <a className='underline' href='mailto:founders@swishjam.com'>founders@swishjam.com</a><br />We add new connections all the time</p>
                      </div>
                      ) : (
                        availableConnections.map((connection) => (
                          <AddConnectionButton
                            img={ALL_CONNECTIONS[connection.name].img}
                            key={connection.name}
                            connection={connection}
                            //apiKey='INSTANCE-7da3a8bc'
                            onConnectionClick={() => setConnectionForModal(connection)}
                          />
                        ))
                      )
                    }
                  </ul>
                </>
              }
            </div>
          </main>
        </>
      )
  );
}