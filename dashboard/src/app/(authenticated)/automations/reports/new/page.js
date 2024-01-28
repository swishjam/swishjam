'use client';

import AddEditReport from "@/components/Automations/Reports/AddEditReport";
import Link from "next/link";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useState } from "react";
//import { Skeleton } from "@/components/ui/skeleton";
//import { toast } from "sonner";
// Icons
import { LuArrowLeft } from "react-icons/lu";

export default function NewReportsPage() {

  const createReport = async (values) => {
    await SwishjamAPI.Reports.create({
      name: values.name,
      cadence: values.cadence,
      sending_mechanism: values.sending_mechanism,
      config: {
        sections: values.messageSections,
        slack_channel_id: values.slack_channel
      }
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
       <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations/reports"
          >
            <LuArrowLeft className='inline mr-1' size={12} />
            Back to all Reports
          </Link>
          <h2 className="text-md font-medium text-gray-700 mb-0">Add New Report</h2>
        </div>
      </div> 
      {/*hasSlackConnection && <AddReportModal open={open} setOpen={setOpen} onNewReport={newReport => setReports([...reports, newReport])} />*/}
      <AddEditReport
        mode={'add'}
        AddSave={createReport}  
        className="mt-8"      
      /> 
    </main>   
  )
}