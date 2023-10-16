'use client';

import ApiKeysTable from "@/components/Settings/ApiKeysTable";
// import { useAuthData } from "@/lib/auth";
import LoadingView from "./LoadingView";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import Toggle from "@/components/utils/Toggle";
import { useState, useEffect } from "react";
import WorkspaceForm from "@/components/Settings/WorkspaceForm";
import WorkspaceSettingsToggles from "@/components/Settings/WorkspaceSettingsToggles";

const Divider = () => <div className="my-6 w-full border-t border-gray-300" />

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState();
  const [workspaceSettings, setWorkspaceSettings] = useState();

  useEffect(() => {
    SwishjamAPI.Config.retrieve().then(({ api_keys, settings }) => {
      setApiKeys(api_keys);
      setWorkspaceSettings(settings);
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

          <Toggle
            className='mt-8'
            text={<span className='text-sm text-gray-700'>Enrich user profile data.</span>}
            checked={workspaceSettings?.should_enrich_user_profile_data}
            onChange={checked => {
              setWorkspaceSettings({ ...workspaceSettings, should_enrich_user_profile_data: checked });
              SwishjamAPI.WorkspaceSettings.update({
                combine_marketing_and_product_data_sources: workspaceSettings.combine_marketing_and_product_data_sources,
                should_enrich_user_profile_data: checked
              })
            }}
          />
          <WorkspaceSettingsToggles settings={workspaceSettings} />
          <Divider />

          <div className='mt-4 space-x-4 space-y-4'>
            <ApiKeysTable apiKeys={apiKeys} />
          </div>
        </main>
      )
  )
}