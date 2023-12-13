'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import EmptyView from './EmptyView';
import Image from 'next/image';
import LoadingView from './LoadingView';
import Modal from '@/components/utils/Modal';
import { RocketIcon } from "@radix-ui/react-icons"
import { RxCardStack } from 'react-icons/rx';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Connection Components
import { AllSources } from './AllIntegrations';
import AddConnectionButton from './AddConnectionButton';
import ExistingConnectionButton from './ExistingConnectionButton';
import SwishjamLogo from '@public/logos/swishjam.png'

export default function Connections() {
  const [enabledConnections, setEnabledConnections] = useState();
  const [disabledConnections, setDisabledConnections] = useState();
  const [availableConnections, setAvailableConnections] = useState();
  const [connectionForModal, setConnectionForModal] = useState(null);
  // const [errorMessage, setErrorMessage] = useState(useSearchParams().get('error'))
  // const [showSuccessMessage, setShowSuccessMessage] = useState(useSearchParams().get('success') === 'true');
  const searchParams = useSearchParams();

  const router = useRouter();

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
    <div>
      <div className="">
        <h2 className="text-md font-medium text-gray-700 mb-0">Data Sources</h2>
        <p className='text-s mt-2'>Pull data into Swishjam and we'll auto reconicle accounts, organizations, and events</p> 
      </div>
      {enabledConnections === undefined
        ? <LoadingView />
        : (
          <>
            {connectionForModal && (
              <Modal size='large' isOpen={true} onClose={() => setConnectionForModal(null)}>
                <div className='flex flex-col items-center justify-center'>
                  <div className='flex flex-col gap-6 xl:flex-row mb-8'>
                    <div className='w-20'>
                      <Image
                        src={AllSources[connectionForModal.name].img}
                        alt={connectionForModal.name}
                        className="w-20 rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                      />
                    </div>
                    <div>
                      <h1 className='text-2xl font-medium'>Connect your {connectionForModal.name} account</h1>
                      <p className='text-gray-600'>{AllSources[connectionForModal.name].description}</p>
                    </div>
                  </div>
                  {AllSources[connectionForModal.name].connectComponent(setConnectionAsConnected)}
                </div>
              </Modal>
            )}
            <div className=''>
              {searchParams.get('success') && (
                <Alert className='mb-2'>
                  <RocketIcon className="h-4 w-4" />
                  <AlertTitle>{window.decodeURIComponent(searchParams.get('newSource') || 'Data source')} is now connected!</AlertTitle>
                  <div className='absolute top-0 right-0 p-2'>
                    <XCircleIcon
                      className='h-5 w-5 rounded-full cursor-pointer hover:bg-gray-200'
                      onClick={() => router.push('/integrations')}
                    />
                  </div>
                  <AlertDescription>
                    Swishjam will automatically import your {window.decodeURIComponent(searchParams.get('newSource') || 'data source')} data now.
                  </AlertDescription>
                </Alert>
              )}
              {searchParams.get('error') && (
                <Alert className='mb-2'>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>{window.decodeURIComponent(searchParams.get('error') || 'An unexpected error occurred, please try again.')}</AlertTitle>
                  <div className='absolute top-0 right-0 p-2'>
                    <XCircleIcon
                      className='h-5 w-5 rounded-full cursor-pointer hover:bg-gray-200'
                      onClick={() => router.push('/integrations')}
                    />
                  </div>
                </Alert>
              )}
              <>
                <ul role="list" className="grid grid-cols-1 mt-6 border-t border-gray-200">
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
                      img={AllSources[connection.name].img}
                      connection={connection}
                      onDisableClick={disableConnection}
                      onRemoveClick={deleteConnection}
                      enabled={true}
                      borderImage={AllSources[connection.name].borderImage}
                    />
                  ))}
                </ul>
                <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8 mt-2">
                  {disabledConnections.map(connection => (
                    <ExistingConnectionButton
                      key={connection.id}
                      img={AllSources[connection.name].img}
                      connection={connection}
                      onRemoveClick={deleteConnection}
                      onEnableClick={enableConnection}
                      enabled={false}
                      borderImage={AllSources[connection.name].borderImage}
                    />
                  ))}
                </ul>

                <h5 className='pt-8 pb-2'>Available Data Sources</h5>
                <ul role="list" className="grid grid-cols-1 mt-4 border-t border-gray-200">
                  {availableConnections.length === 0
                    ? (
                      <div className="text-center col-span-3 my-8">
                        <RxCardStack className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">You have installed all available Swishjam Data Sources.</h3>
                        <p className="mt-1 text-sm text-gray-500">Looking for a connection that is not yet supported? <br />Reach out to us <a className='underline' href='mailto:founders@swishjam.com'>founders@swishjam.com</a></p>
                      </div>
                    ) : (
                      availableConnections.map((connection) => (
                        <AddConnectionButton
                          img={AllSources[connection.name].img}
                          key={connection.name}
                          connection={connection}
                          onConnectionClick={() => setConnectionForModal(connection)}
                          borderImage={AllSources[connection.name].borderImage}
                        />
                      ))
                    )
                  }
                </ul>
              </>

            </div>
      </>)}

    </div>
  );
}

/* {isLoading ? */ 
//   <div className="mt-24 h-5 w-5 mx-auto">
//     <LoadingSpinner size={8} />
//   </div> :
//   (triggers?.length > 0 ?
//     <div>
//     </div>:
//     <EmptyState title={hasSlackConnection ? "No Event Triggers":"Connect Slack To Use Event Triggers"} />
//   )
// }