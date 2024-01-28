'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import EmptyState from '../EmptyState';
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
                      
import { LuPlus, LuClock, LuPause, LuPlay, LuPencil, LuTrash } from "react-icons/lu";
import { HiOutlineMail } from "react-icons/hi";
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
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

  const loadReports = async () => {
    const [reports, slackConnection] = await Promise.all([
      SwishjamAPI.Reports.list(),
      SwishjamAPI.SlackConnections.get(),
    ]);
    setReports(reports)
    setHasSlackConnection(slackConnection !== null);
  }

  useEffect(() => {
    loadReports()
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-medium text-gray-700 mb-0">Reports</h2>
        {hasSlackConnection && 
          <Link href="/automations/reports/new">
            <Button
              className={`duration-300 transition-all ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
            >
              <LuPlus className="h-4 w-4 mt-0.5 mr-2" />
              Add Report
            </Button>
          </Link> 
        }
      </div>
      {reports === undefined ? (
        <div>
          <ul role="list" className="w-full space-y-2 mt-8">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton className='w-full h-10' key={i} />)}
          </ul>
        </div>
      ) : (
        reports.length > 0 ? (
          <div>
            <ul role="list" className="w-full space-y-2 mt-8">
              {reports.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(report => (
                <li key={report.id} className="bg-white relative flex items-center space-x-4 px-4 py-2 border border-gray-300 rounded">
                  <div className="min-w-0 flex-auto">
                    <div className="flex items-center gap-x-3">
                      {report.sending_mechanism == 'slack' && <SiSlack className="w-4 h-4" />}
                      {report.sending_mechanism == 'email' && <HiOutlineMail className="w-4 h-4" />}
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-gray-600">
                        <span className="truncate capitalize">{report?.sending_mechanism} {report?.name}</span>
                      </h2>
                    </div>
                  </div>
                  {report.enabled &&
                    <div className="inline-flex items-center gap-x-1.5 px-1.5 capitalize">
                      <LuClock className="w-4 h-4" />
                      {report.cadence}
                    </div>
                  }
                  {report.enabled ? (
                    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 capitalize">
                      <svg className="h-1.5 w-1.5 fill-green-500" viewBox="0 0 6 6" aria-hidden="true">
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                      <svg className="h-1.5 w-1.5 fill-red-500" viewBox="0 0 6 6" aria-hidden="true">
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      Disabled
                    </span>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Cog6ToothIcon className="h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-36" align={'end'}>
                      <DropdownMenuLabel>Edit Report</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/automations/reports/${report.id}/edit`}>
                        <DropdownMenuItem className='cursor-pointer'>
                          <LuPencil className='h-4 w-4 inline-block mr-2' />
                          Edit
                        </DropdownMenuItem>
                      </Link>                    

                      <DropdownMenuGroup>
                        {report.enabled ? (
                          <DropdownMenuItem onClick={() => pauseReport(report.id)} className="cursor-pointer">
                            <LuPause className='h-4 w-4 inline-block mr-2' />
                            Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => resumeReport(report.id)} className="cursor-pointer">
                            <LuPlay className='h-4 w-4 inline-block mr-2' />
                            Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="!text-red-400 cursor-pointer" onClick={() => deleteReport(report.id)}>
                          <LuTrash className='h-4 w-4 inline-block mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            title={
              hasSlackConnection
                ? "No Reports"
                : <><Link className='text-blue-700 underline' href='/integrations/destinations'>Connect Slack</Link> to begin creating reports.</>
            }
          />
        )
      )}
    </div>
  )
}