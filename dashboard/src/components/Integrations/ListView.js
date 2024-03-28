import AddIntegrationButton from './AddIntegrationButton';
import { AllDataSources, AllDestinations } from './AllIntegrations';
import ExistingIntegrationButton from './ExistingIntegrationButton';
import EmptyView from './EmptyView';
import Image from 'next/image';
import LoadingView from './LoadingView';
import Modal from '@/components/utils/Modal';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { swishjam } from '@swishjam/react';

export default function IntegrationsList({ title, subTitle, type = 'data_source' }) {
  const [enabledIntegrations, setEnabledIntegrations] = useState();
  const [disabledIntegrations, setDisabledIntegrations] = useState();
  const [availableIntegrations, setAvailableIntegrations] = useState();
  const [integrationForModal, setIntegrationForModal] = useState(null);
  const searchParams = useSearchParams();

  if (!['destinations', 'data_sources'].includes(type)) {
    throw new Error('Invalid type. Expected either `destinations` or `data_sources`.');
  }

  const integrationsMap = type === 'destinations' ? AllDestinations : AllDataSources;

  const setIntegrationAsConnected = integration => {
    setEnabledIntegrations([...enabledIntegrations, integration]);
    setAvailableIntegrations(availableIntegrations.filter(({ name }) => name !== integration.name));
  }

  const disableIntegration = async integrationId => {
    const result = await SwishjamAPI.Integrations.disable(integrationId);
    if (result.success) {
      toast.success('Integration disabled.')
      setEnabledIntegrations(enabledIntegrations.filter(integration => integration.id !== integrationId));
      setDisabledIntegrations([...disabledIntegrations, enabledIntegrations.find(integration => integration.id === integrationId)]);
    }
  }

  const enableintegration = async integrationId => {
    const result = await SwishjamAPI.Integrations.enable(integrationId);
    if (result.success) {
      toast.success('Integration enabled.')
      setDisabledIntegrations(disabledIntegrations.filter(integration => integration.id !== integrationId));
      setEnabledIntegrations([...enabledIntegrations, disabledIntegrations.find(integration => integration.id === integrationId)]);
    }
  }

  const deleteIntegration = async integrationId => {
    const result = await SwishjamAPI.Integrations.delete(integrationId);
    if (result.success) {
      toast.success('Integration deleted.')
      setAvailableIntegrations([...availableIntegrations, [...enabledIntegrations, ...disabledIntegrations].find(integration => integration.id === integrationId)]);
      setEnabledIntegrations(enabledIntegrations.filter(integration => integration.id !== integrationId));
      setDisabledIntegrations(disabledIntegrations.filter(integration => integration.id !== integrationId));
    }
  }

  const getintegrations = async () => {
    const { enabled_integrations, disabled_integrations, available_integrations } = await SwishjamAPI.Integrations.list({ destinations: type === 'destinations' });
    setEnabledIntegrations(enabled_integrations);
    setDisabledIntegrations(disabled_integrations);
    setAvailableIntegrations(available_integrations);
  }

  useEffect(() => {
    getintegrations();

    if (searchParams.get('success') && searchParams.get('success') !== 'false') {
      swishjam.event('integration_connected', {
        integration_name: searchParams.get('newSource') || searchParams.get('new_source') || searchParams.get('source') || searchParams.get('integration') || 'Not specified',
      })
      toast.success(`${window.decodeURIComponent(searchParams.get('newSource') || 'Data source')} is now connected!`, {
        description: `Swishjam will automatically import your ${window.decodeURIComponent(searchParams.get('newSource') || 'data source')} data now.`,
        duration: 10_000,
      })
    }
    if (searchParams.get('error') || searchParams.get('success') === 'false') {
      swishjam.event('error_connecting_integration', {
        integration_name: searchParams.get('newSource') || searchParams.get('new_source') || searchParams.get('source') || searchParams.get('integration') || 'Not specified',
        error: searchParams.get('error') || searchParams.get('message'),
      })
      toast.error(`Error connecting ${window.decodeURIComponent(searchParams.get('newSource') || 'Data source')}`, {
        description: `Contact founders@swishjam.com for help getting setup`,
        duration: 10_000,
      })
    }
  }, []);

  return (
    <div>
      <div className="">
        <h2 className="text-md font-medium text-gray-700 mb-0">{title}</h2>
        <p className='text-sm mt-2'>{subTitle}</p>
      </div>
      {enabledIntegrations === undefined
        ? <LoadingView title={title} subTitle={subTitle} />
        : (
          <>
            {integrationForModal && (
              <Modal size='large' isOpen={true} onClose={() => setIntegrationForModal(null)}>
                <div className='flex flex-col items-center justify-center'>
                  <div className='flex flex-col gap-6 xl:flex-row mb-8'>
                    <div className='w-20'>
                      <Image
                        src={integrationsMap[integrationForModal.name].img}
                        alt={integrationForModal.name}
                        className="w-20 rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                      />
                    </div>
                    <div>
                      <h1 className='text-2xl font-medium'>Connect your {integrationForModal.name} account</h1>
                      <p className='text-gray-600'>{integrationsMap[integrationForModal.name].description}</p>
                    </div>
                  </div>
                  {integrationsMap[integrationForModal.name].connectComponent(setIntegrationAsConnected)}
                </div>
              </Modal>
            )}
            <div className=''>
              <ul role="list" className="grid grid-cols-1 mt-6 border-t border-gray-200">
                {enabledIntegrations.map(integration => (
                  <ExistingIntegrationButton
                    key={integration.id}
                    canEdit={integration.cannot_manage !== true}
                    img={integrationsMap[integration.name].img}
                    integration={integration}
                    onDisableClick={disableIntegration}
                    onRemoveClick={deleteIntegration}
                    enabled={true}
                    borderImage={integrationsMap[integration.name].borderImage}
                  />
                ))}
              </ul>
              <ul role="list" className="grid grid-cols-1">
                {disabledIntegrations.map(integration => (
                  <ExistingIntegrationButton
                    key={integration.id}
                    img={integrationsMap[integration.name].img}
                    integration={integration}
                    onRemoveClick={deleteIntegration}
                    onEnableClick={enableintegration}
                    enabled={false}
                    borderImage={integrationsMap[integration.name].borderImage}
                  />
                ))}
              </ul>

              <h5 className='pt-8 pb-2'>Available {title}</h5>
              <ul role="list" className="grid grid-cols-1 mt-4 border-t border-gray-200">
                {availableIntegrations.length === 0
                  ? (
                    <EmptyView
                      title={`All ${title} Connected`}
                      description="Reach out to founders@swishjam.com if you need more"
                    />
                  ) : (
                    availableIntegrations.map((integration) => (
                      <AddIntegrationButton
                        img={integrationsMap[integration.name].img}
                        key={integration.name}
                        integration={integration}
                        onIntegrationClick={() => {
                          swishjam.event('add_integration_clicked', { integration_name: integration.name })
                          setIntegrationForModal(integration)
                        }}
                        borderImage={integrationsMap[integration.name].borderImage}
                      />
                    ))
                  )
                }
              </ul>
            </div>
          </>)}

    </div>
  );
}