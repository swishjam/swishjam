'use client'

import LoadingSpinner from "@/components/LoadingSpinner";
import PageWithHeader from "@/components/utils/PageWithHeader";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState();

  useEffect(() => {
    SwishjamAPI.Workspaces.list().then(setWorkspaces)
  }, [])

  return (
    <PageWithHeader title='Your Workspaces'>
      {!workspaces
        ? (
          <div className='w-full h-72 flex items-center justify-center'>
            <LoadingSpinner size={12} />
          </div>
        ) : (
          <div className='space-y-4'>
            {workspaces.map(w => (
              <Link
                href={`/change-workspaces/${w.id}`}
                className='flex justify-between px-4 py-4 bg-white rounded-md border border-zinc-200 text-md text-gray-700 cursor-pointer hover:bg-gray-50 hover:underline'
              >
                <span>{w.name}</span>
                <ChevronRightIcon className='h-6 w-6 text-gray-700' />
              </Link>
            ))}
          </div>
        )}
    </PageWithHeader>
  )
}