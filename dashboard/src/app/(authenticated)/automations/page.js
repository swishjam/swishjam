'use client';

//import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useState, useEffect } from "react";
import EmptyState from './EmptyState';


export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState();
  // const [workspaceSettings, setWorkspaceSettings] = useState();

  useEffect(() => {
    // SwishjamAPI.Config.retrieve().then(({ api_keys, settings }) => {
    //   setApiKeys(api_keys);
    //   setWorkspaceSettings(settings);
    // });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-medium text-gray-700 mb-0">Workflows</h2>
      </div>
      <EmptyState title="Workflows (Coming Soon)"/>    
    </div>
  )
}