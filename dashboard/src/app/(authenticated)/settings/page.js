'use client';

import ApiKeysTable from "@/components/Settings/ApiKeysTable";
import LoadingView from "./LoadingView";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useState, useEffect } from "react";
import WorkspaceForm from "@/components/Settings/WorkspaceForm";
import WorkspaceSettingsToggles from "@/components/Settings/WorkspaceSettingsToggles";
import EnrichmentSettings from '@/components/Settings/EnrichmentSettings';

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
        <>
          <WorkspaceForm />

          <div className='mt-8'>
            <WorkspaceSettingsToggles settings={workspaceSettings} />
          </div>

          <div className='mt-8'>
            <EnrichmentSettings
              isEnabled={workspaceSettings?.should_enrich_user_profile_data}
              enrichmentProvider={workspaceSettings?.enrichment_provider}
              onEnrichmentToggle={checked => {
                setWorkspaceSettings({ ...workspaceSettings, should_enrich_user_profile_data: checked })
                SwishjamAPI.WorkspaceSettings.update({
                  combine_marketing_and_product_data_sources: workspaceSettings.combine_marketing_and_product_data_sources,
                  should_enrich_user_profile_data: checked
                })
              }}
            />
          </div>

          <div className='mt-8 space-x-4 space-y-4'>
            <ApiKeysTable apiKeys={apiKeys} />
          </div>
        </>
      )
  )
}