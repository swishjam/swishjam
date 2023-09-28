'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuthData } from '@/lib/auth';
import { API } from '@/lib/api-client/base';
import LoadingView from './LoadingView';
import EmptyView from './EmptyView';
import Image from 'next/image';
import Modal from '@/components/utils/Modal';
import AddConnectionButton from './AddConnectionButton';
import ExistingConnectionButton from './ExistingConnectionButton';

import StripeImg from '@public/stripe-logo.jpeg'

const CONNECTION_IMAGES = {
  Stripe: StripeImg,
}

const CONNECTION_OAUTH_URLS = {
  Stripe: authToken => `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_ONSwwqiCfDZHQzg1hURYH5pfTVj1PrAe&scope=read_write&redirect_uri=http://localhost:4242/oauth/stripe/callback&state={"authToken":"${authToken}"}`
}

const CONNECTION_DESCRIPTIONS = {
  Stripe: 'Connect your Stripe account to Swishjam to automatically import your Stripe customers and subscriptions.',
}

export default function Connections() {
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
    enabledConnections === undefined
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
              {enabledConnections.length + disabledConnections.length === 0 &&
                <EmptyView
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
                        connection={connection}
                        onDisableClick={disableConnection}
                        onRemoveClick={removeConnection}
                        enabled={true}
                      />
                    ))}
                  </ul>
                </> 
              }
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
                    <div className='text-center my-4 text-md text-gray-600 col-span-3'>
                      You have installed all Swishjam connections! <br /> Looking for a connection that is not yet supported? Reach out to us <a className='underline' href='mailto:founders@swishjam.com'>founders@swishjam.com</a>.
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
      )
  );
}