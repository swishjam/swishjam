'use client';

import Image from 'next/image';
import LoadingView from '../LoadingView';
import Modal from '@/components/utils/Modal';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/20/solid'

// Connection Components
import { AllDestinations } from '../AllIntegrations';
import EmptyView from '../EmptyView';
//import AddConnectionButton from '../AddConnectionButton';
//import ExistingConnectionButton from '../ExistingConnectionButton';

export default function IntegrationsDestinations() {
  const [hasSlackConnection, setHasSlackConnection] = useState();
  const [connectionForModal, setConnectionForModal] = useState();
  const [connectionAsConnected, setConnectionAsConnected] = useState();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const getConnections = async () => {
      const res = await SwishjamAPI.SlackConnections.get();
      setHasSlackConnection(res !== null);
    }
    getConnections();

    if (searchParams.get('success')) {
      toast.success(`${window.decodeURIComponent(searchParams.get('newSource') || 'Data source')} is now connected!`, {
        description: `Swishjam will automatically import your ${window.decodeURIComponent(searchParams.get('newSource') || 'data source')} data now.`
      })
    }
    if (searchParams.get('error')) {
      toast.error(`Error connecting ${window.decodeURIComponent(searchParams.get('newSource') || 'Data source')}`, {
        description: `Contact founders@swishjam.com for help getting setup`
      })
    }
  }, []);

  return (
    <div>
      {connectionForModal && (
        <Modal size='large' isOpen={true} onClose={() => setConnectionForModal(null)}>
          <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col gap-6 xl:flex-row mb-8'>
              <div className='w-20'>
                <Image
                  src={AllDestinations['Slack'].img}
                  alt={connectionForModal.name}
                  className="w-20 object-cover"
                />
              </div>
              <div>
                <h1 className='text-2xl font-medium'>Connect Your {connectionForModal.name} account</h1>
                <p className='text-gray-600'>{AllDestinations[connectionForModal.name].description}</p>
              </div>
            </div>
            {AllDestinations[connectionForModal.name].connectComponent(setConnectionAsConnected)}
          </div>
        </Modal>
      )}
      <div className="">
        <h2 className="text-md font-medium text-gray-700 mb-0">Destinations</h2>
        <p className='text-sm mt-2'>Get the right information where you need it.</p>
      </div>
      {hasSlackConnection === undefined
        ? <LoadingView />
        : (
          <div className=''>
            <>
              <ul role="list" className="grid grid-cols-1 mt-6 border-t border-gray-200">
                {hasSlackConnection === true ?
                  <li
                    className="border-b border-gray-200 group cursor-pointer duration-300 transition offset-2"
                  //onClick={onConnectionClick}
                  >
                    <div className="flex items-center gap-x-4 py-4">
                      <Image
                        src={AllDestinations['Slack'].img}
                        alt={'Slack'}
                        className={`w-12 flex-none rounded-lg bg-white object-cover ${AllDestinations['Slack'].borderImage ? 'ring-1 ring-gray-900/10' : ''}`}
                      />
                      <div className="text-sm font-medium leading-6 text-gray-900">Slack</div>
                      <div className='relative ml-auto'>
                        {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-white text-slate-900 border border-gray-200 hover:bg-white hover:text-swishjam duration-300 transition-all">
                            <Cog6ToothIcon className="h-5 w-5 mr-4" aria-hidden="true" />
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-36" align={'end'}>
                          <DropdownMenuLabel>Edit Destination</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="!text-red-400 cursor-pointer" onClick={() => onRemoveClick(connection.id)}>
                              <TrashIcon className='h-4 w-4 inline-block mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu> */}
                      </div>
                    </div>
                  </li> :
                  <EmptyView title="No Destinations Connected" description="Connect your first destination" />
                }
              </ul>

              <h5 className='pt-8 pb-2'>Available Destinations</h5>
              <ul role="list" className="grid grid-cols-1 mt-4 border-t border-gray-200">
                {hasSlackConnection === false ? (
                  <li
                    className="border-b border-gray-200 group cursor-pointer duration-300 transition offset-2"
                    onClick={() => setConnectionForModal(AllDestinations['Slack'])}
                  >
                    <div className="flex items-center gap-x-4 py-4">
                      <Image
                        src={AllDestinations['Slack'].img}
                        alt={'Slack'}
                        className={`w-12 flex-none rounded-lg bg-white object-cover ${AllDestinations['Slack'].borderImage ? 'ring-1 ring-gray-900/10' : ''}`}
                      />
                      <div className="text-sm font-medium leading-6 text-gray-900">Slack</div>
                      <div className='relative ml-auto'>
                        <Button className="bg-white text-slate-900 border border-gray-200 hover:bg-white group-hover:text-swishjam duration-300 transition-all">
                          <PlusIcon className='h-6 w-6 text-gray-600 group-hover:text-swishjam duration-300 transition' />
                          Add Slack
                        </Button>
                      </div>
                    </div>
                  </li>
                ) : (
                  <EmptyView title="All Destinations Connected" description={"Contact founders@swishjam.com to get more apps connected"} />
                )}
              </ul>
            </>
          </div>
        )
      }

    </div>
  );
}