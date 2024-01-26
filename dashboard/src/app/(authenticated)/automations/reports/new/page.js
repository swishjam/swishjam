'use client';

import AddEditReport from "@/components/Automations/Reports/AddEditReport";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Divider from "@/components/Divider";
// Icons
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { HiOutlineMail } from "react-icons/hi";
import { PauseCircleIcon, PlayCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { LuArrowLeft, LuClock } from "react-icons/lu";
import { SiSlack } from "react-icons/si";

export default function ReportsPage() {
  const [reports, setReports] = useState();
  const [hasSlackConnection, setHasSlackConnection] = useState();
  const [open, setOpen] = useState(false);

  const pauseReport = async (reportId) => {
    SwishjamAPI.Reports.disable(reportId).then(({ report, error }) => {
      if (error) {
        toast("Uh oh! Something went wrong.", {
          description: "Contact founders@swishjam.com for help",
        })
      } else {
        toast.success('Report paused')
        setReports([...reports.filter((t) => t.id !== reportId), report])
      }
    })
  }

  const resumeReport = async (reportId) => {
    SwishjamAPI.Reports.enable(reportId).then(({ report, error }) => {
      if (error) {
        toast("Uh oh! Something went wrong.", {
          description: error,
        })
      } else {
        toast.success('Report resumed')
        setReports([...reports.filter((t) => t.id !== reportId), report])
      }
    })
  }

  const deleteReport = async reportId => {
    SwishjamAPI.Reports.delete(reportId).then(({ error }) => {
      if (error) {
        toast("Uh oh! Something went wrong.", {
          description: error,
        })
      } else {
        toast.success('Report deleted')
        setReports([...reports.filter((t) => t.id !== reportId)])
      }
    })
  }

  const loadReport = async () => {
    const [report, slackConnection] = await Promise.all([
      SwishjamAPI.Reports.list(),
      SwishjamAPI.SlackConnections.get(),
    ]);
    setReports(reports)
    setHasSlackConnection(slackConnection !== null);
  }

  useEffect(() => {
    loadReport()
  }, []);

  return (
    <div>
       <div className="grid grid-cols-2 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations/reports"
          >
            <LuArrowLeft className='inline mr-1' size={12} />
            Back to all Event Triggers
          </Link>
          <h2 className="text-md font-medium text-gray-700 mb-0">Add New Report</h2>
        </div>
      </div> 
      {/*hasSlackConnection && <AddReportModal open={open} setOpen={setOpen} onNewReport={newReport => setReports([...reports, newReport])} />*/}
      <AddEditReport
        onNewReport={() => console.log('New report')}  
        className="mt-8"      
      /> 
    </div>
      
  )
}