'use client'

import { useEffect, useState } from 'react';
import AddEditReport from "@/components/Automations/Reports/AddEditReport";
import Link from "next/link";
import { toast } from "sonner";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
// Icons
import { LuArrowLeft } from "react-icons/lu";

export default function EditReportPage({ params }) {
  const { id } = params;
  const [reportData, setReportData] = useState()

  useEffect(() => {
    SwishjamAPI.Reports.retrieve(id).then(({ report, error }) => {
      if (report) {
        setReportData(report)
      } else {
        toast.error("Uh oh! Error loading report", {
          description: "Contact founders@swishjam.com for help",
        })
      }
    })
  }, [id])

  const updateReport = async (values) => {
    return await SwishjamAPI.Reports.update(id, values)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/reports"
          >
            <LuArrowLeft className='inline mr-1' size={12} />
            Back to all Reports
          </Link>
          <h2 className="text-md font-medium text-gray-700 mb-0">Edit Report</h2>
        </div>
      </div>
      {reportData &&
        <AddEditReport
          onSave={updateReport}
          reportId={id}
          defaultReportValues={reportData}
          className="mt-8"
        />
      }
    </main>
  )
}