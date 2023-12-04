'use client';

import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useState, useEffect } from "react";
import EmptyState from '../EmptyState';
import LoadingSpinner from "@/components/LoadingSpinner";
// import { usePathname } from 'next/navigation'
// import Tabs from '@/components/Automations/Tabs';

export default function ReportsPage() {
  const [reports, setReports] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     SwishjamAPI.Reports.list().then(reports => {
      console.log('Reports', reports)
      setReports(reports)
      setIsLoading(false)
      // handle reports
     });
    // SwishjamAPI.Config.retrieve().then(({ api_keys, settings }) => {
    //   setApiKeys(api_keys);
    //   setWorkspaceSettings(settings);
    // });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-medium text-gray-700 mb-0">Reports</h2>
        <button
          type="submit"
          className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
          disabled={isLoading}
        >
          Add Report
        </button>
      </div>
      {isLoading ? 
        <div className="mt-24 h-5 w-5 mx-auto">
          <LoadingSpinner size={8} />
        </div> :
        (reports.length > 0 ? 
          <div></div>:
          <EmptyState title="Add a Report" />
        )
      }
    </div>
  )
}