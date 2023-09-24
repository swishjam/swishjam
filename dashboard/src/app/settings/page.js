'use client';

import { useState } from "react";
import useLoggedInEffect from "@/lib/hooks/useLoggedInEffect";
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { API } from "@/lib/api-client/base";
import { useAuthData } from "@/lib/auth";
import NewAnalyticsFamilyConfigurationForm from "@/components/Settings/AnalyticsFamilyConfigurationForm";
import AnalyticsFamilyConfigurationPill from "@/components/Settings/AnalyticsFamilyConfigurationPill";
import WorkspaceForm from "@/components/Settings/WorkspaceForm";
import CopyToClipboard from "react-copy-to-clipboard";
import { ClipboardDocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Skeleton } from "@/components/ui/skeleton";

const PublicKeySection = ({ publicKey }) => {
  const [publicKeyCopyText, setPublicKeyCopyText] = useState();
  return (
    <div>
      <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
        Workspace public key
      </label>
      <div className="mt-2 flex">
        {publicKey 
          ? (
            <div className="flex items-center cursor-pointer rounded-md shadow-sm ring-1 ring-inset ring-gray-300 px-2 py-1 bg-gray-200 italic text-xs">
              <CopyToClipboard
                text={publicKey}
                onCopy={() => {
                  setPublicKeyCopyText(<CheckCircleIcon className='inline w-5 h-5 text-green-500' />)
                  setTimeout(() => setPublicKeyCopyText(), 5_000);
                }}
              >
                <span className='flex items-center'>
                  <span className='font-medium'>{publicKey}</span>
                  <span className='inline ml-1'>{publicKeyCopyText || <ClipboardDocumentIcon className='inline w-5 h-5 text-gray-700' />}</span>
                </span>
              </CopyToClipboard>
            </div>
          ) : <Skeleton className='w-48 h-10 bg-gray-200' />
        }
      </div>
    </div>
  )
}

const Divider = () => (
  <div className="my-6 w-full border-t border-gray-300" />
)

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 my-8 flex items-center'>
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
      </div>
    </div>

    <WorkspaceForm isSubmittable={false} />
    <Divider />
    <NewAnalyticsFamilyConfigurationForm isSubmittable={false} />

    <div className='mt-4 space-x-4'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="inline-flex items-center gap-x-0.5 rounded-md animate-pulse bg-gray-200 w-48 h-10 ring-1 ring-inset ring-gray-500/10" />
      ))}
    </div>

    <Divider />
    <PublicKeySection />
  </main>
)

export default function SettingsPage() {
  const [analyticsFamilyConfigurations, setAnalyticsFamilyConfigurations] = useState();
  const { authData } = useAuthData();

  useLoggedInEffect(() => {
    API.get('/api/v1/analytics_family_configurations').then(setAnalyticsFamilyConfigurations);
  }, []);

  return (
    <AuthenticatedView LoadingView={<LoadingState />}>
      {analyticsFamilyConfigurations === undefined 
        ? <LoadingState />
        : (
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
            <div className='grid grid-cols-2 my-8 flex items-center'>
              <div>
                <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
              </div>
            </div>
  
            <WorkspaceForm />
            <Divider />
            <NewAnalyticsFamilyConfigurationForm onNewAnalyticsFamilyConfiguration={setAnalyticsFamilyConfigurations} />
  
            <div className='mt-4 space-x-4 space-y-4'>
              {analyticsFamilyConfigurations.map((config, i) => (
                <AnalyticsFamilyConfigurationPill 
                  key={i} 
                  analyticsFamilyConfiguration={config} 
                  onDelete={setAnalyticsFamilyConfigurations} 
                />
              ))}
            </div>
  
            <Divider />
            
            <PublicKeySection publicKey={authData?.currentWorkspacePublicKey()} />
          </main>
        )
      }
    </AuthenticatedView>
  )
}