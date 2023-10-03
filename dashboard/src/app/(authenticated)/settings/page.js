'use client';

import { useState, useEffect } from "react";
import { API } from "@/lib/api-client/base";
// import { useAuthData } from "@/lib/auth";
import WorkspaceForm from "@/components/Settings/WorkspaceForm";
import LoadingView from "./LoadingView";
import ApiKeysTable from "@/components/Settings/ApiKeysTable";

const Divider = () => <div className="my-6 w-full border-t border-gray-300" />

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState();
  // const { authData } = useAuthData();

  useEffect(() => {
    API.get('/api/v1/config').then(({ api_keys }) => {
      setApiKeys(api_keys);
    });
  }, []);

  return (
    apiKeys === undefined 
      ? <LoadingView />
      : (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <div className='grid grid-cols-2 my-8 flex items-center'>
            <div>
              <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
            </div>
          </div>

          <WorkspaceForm />
          <Divider />

          <div className='mt-4 space-x-4 space-y-4'>
            <ApiKeysTable apiKeys={apiKeys} />
          </div>
        </main>
      )
  )
}