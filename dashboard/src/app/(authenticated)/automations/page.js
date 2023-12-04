'use client';

import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
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
        {/*<button
          type="submit"
          className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
          disabled={isLoading}
        >
          Create Workflow
        </button>*/}
      </div>
      <EmptyState title="Workflows (Coming Soon)"/>    
    </div>
  )
}