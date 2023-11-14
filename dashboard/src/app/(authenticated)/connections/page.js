'use client';

import { useState, useEffect } from 'react';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api';
import LoadingView from './LoadingView';
import EmptyView from './EmptyView';
import Image from 'next/image';
import Modal from '@/components/utils/Modal';
import AddConnectionButton from './AddConnectionButton';
import ExistingConnectionButton from './ExistingConnectionButton';
import { RxCardStack } from 'react-icons/rx';

import CalComConnectView from '@/components/Connections/ConnectViews/CalCom';
import ConnectStripeView from '@/components/Connections/ConnectViews/Stripe';
import ResendConnectView from '@/components/Connections/ConnectViews/Resend';

import CalComLogo from '@public/logos/calcom.png'
// import HubspotLogo from '@public/logos/hubspot.jpeg';
import ResendLogo from '@public/logos/resend.png'
// import SalesforceLogo from '@public/logos/salesforce.png'
import StripeLogo from '@public/logos/stripe.jpeg'
import SwishjamLogo from '@public/logos/swishjam.png'
// import ZendeskLogo from '@public/logos/Zendesk.webp'

const ALL_CONNECTIONS = {
  Stripe: {
    img: StripeLogo,
    description: 'Connect your Stripe account to Swishjam to automatically import your Stripe customers and subscriptions.',
    connectComponent: onNewConnection => <ConnectStripeView onNewConnection={onNewConnection} />,
  },
  Resend: {
    img: ResendLogo,
    description: 'Connect your Resend account to enable Swishjam to capture email events.',
    connectComponent: onNewConnection => <ResendConnectView onNewConnection={onNewConnection} />,
    borderImage: true,
  },
  'Cal.com': {
    img: CalComLogo,
    description: 'Connect your Cal.com to Swishjam to automatically capture your Cal.com calendar events.',
    connectComponent: onNewConnection => <CalComConnectView onNewConnection={onNewConnection} />,
  }
  // Hubspot: { img: HubspotLogo },
  // Salesforce: { img: SalesforceLogo },
  // Zendesk: {
  //   img: ZendeskLogo,
  //   borderImage: true,
  // },
}

export default function Connections() {
  const [enabledConnections, setEnabledConnections] = useState();
  const [disabledConnections, setDisabledConnections] = useState();
  const [availableConnections, setAvailableConnections] = useState();
  const [connectionForModal, setConnectionForModal] = useState(null);

  const setConnectionAsConnected = connection => {
    setEnabledConnections([...enabledConnections, connection]);
    setAvailableConnections(availableConnections.filter(({ id }) => id === connection.id));
  }

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

  const deleteConnection = async connectionId => {
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
      setAvailableConnections([
        ...available_integrations,
        // { id: 'hubspot', name: 'Hubspot' },
        // { id: 'salesforce', name: 'Salesforce' },
        // { id: 'zendesk', name: 'Zendesk' },
      ]);
    }
    getConnections();
  }, []);

  return (
    enabledConnections === undefined
      ? <LoadingView />
      : (
        <>
          {connectionForModal && (
            <Modal size='large' isOpen={true} onClose={() => setConnectionForModal(null)}>
              <div className='flex flex-col items-center justify-center'>
                <Image
                  src={ALL_CONNECTIONS[connectionForModal.name].img}
                  alt={connectionForModal.name}
                  className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                />
                <h1 className='text-2xl font-medium mb-4 mt-4'>Connect your {connectionForModal.name} account</h1>
                <p className='text-gray-600 text-center mb-8'>{ALL_CONNECTIONS[connectionForModal.name].description}</p>
                {ALL_CONNECTIONS[connectionForModal.name].connectComponent(setConnectionAsConnected)}
              </div>
            </Modal>
          )}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
            <div className='grid grid-cols-2 mt-8 flex items-center'>
              <div>
                <h1 className="text-lg font-medium text-gray-700 mb-0">Data Sources</h1>
              </div>
              <div className="w-full flex items-center justify-end">
              </div>
            </div>
            <div className='pt-12'>
              {enabledConnections.length + disabledConnections.length === 0 && (
                <EmptyView
                  allConnections={ALL_CONNECTIONS}
                  availableConnections={availableConnections}
                  setConnectionForModal={setConnectionForModal}
                />
              )}
              {enabledConnections.length + disabledConnections.length > 0 && (
                <>
                  <h5 className='py-2'>Connections</h5>
                  <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                    <ExistingConnectionButton
                      key='marketing-analytics'
                      img={SwishjamLogo}
                      connection={{ id: 'swishjam-marketing', name: 'Marketing Site Analytics' }}
                      canEdit={false}
                      enabled={true}
                      disableImageBorder={true}
                    />
                    <ExistingConnectionButton
                      key='product-analytics'
                      img={SwishjamLogo}
                      connection={{ id: 'swishjam-marketing', name: 'Product Analytics' }}
                      canEdit={false}
                      enabled={true}
                      disableImageBorder={true}
                    />
                    {enabledConnections.map(connection => (
                      <ExistingConnectionButton
                        key={connection.id}
                        img={ALL_CONNECTIONS[connection.name].img}
                        connection={connection}
                        onDisableClick={disableConnection}
                        onRemoveClick={deleteConnection}
                        enabled={true}
                        borderImage={ALL_CONNECTIONS[connection.name].borderImage}
                      />
                    ))}
                  </ul>
                  <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8 mt-2">
                    {disabledConnections.map(connection => (
                      <ExistingConnectionButton
                        key={connection.id}
                        img={ALL_CONNECTIONS[connection.name].img}
                        connection={connection}
                        onRemoveClick={deleteConnection}
                        onEnableClick={enableConnection}
                        enabled={false}
                        borderImage={ALL_CONNECTIONS[connection.name].borderImage}
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
                          <p className="mt-1 text-sm text-gray-500">Looking for a connection that is not yet supported? <br />Reach out to us <a className='underline' href='mailto:founders@swishjam.com'>founders@swishjam.com</a></p>
                        </div>
                      ) : (
                        availableConnections.map((connection) => (
                          <AddConnectionButton
                            img={ALL_CONNECTIONS[connection.name].img}
                            key={connection.name}
                            connection={connection}
                            onConnectionClick={() => setConnectionForModal(connection)}
                            borderImage={ALL_CONNECTIONS[connection.name].borderImage}
                          />
                        ))
                      )
                    }
                  </ul>
                </>
              )}
            </div>
          </main>
        </>
      )
  );
}